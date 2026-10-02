---
name: deploy
description: Publish the tsukiMOJi packages to npm, PyPI and RubyGems. Checks versions, runs the tests, builds, publishes each package, then confirms the registry shows it. Pass "npm", "pypi" or "gem" to publish just one; with no argument it publishes all three.
disable-model-invocation: true
argument-hint: "[npm|pypi|gem]"
---

# Deploy tsukiMOJi

Sam typing `/deploy` is the go-ahead to publish **this version, in this run**.
It doesn't cover a different version, a later run, or a package he didn't ask
for. Published versions can't be reused, so stop and ask whenever something
doesn't look right.

Targets: `$ARGUMENTS`. If that's empty, deploy all three.

Run everything from the repo root in Git Bash.

## 1. Pre-flight (read-only)

```sh
bash .claude/skills/deploy/status.sh
```

The script shows the local versions, what each registry already has, the
logins and git status. Stop and tell Sam if:

- **The four versions don't match.** Fix them first. Ask Sam which version he
  wants; don't pick one yourself.
- **The local version is already on a target registry (200).** That version
  is used up. Ask Sam whether to bump. A bump changes all four places
  (`npm/package.json`, `python/pyproject.toml`, `__version__` in
  `python/src/tsukimoji/__init__.py`, `ruby/tsukimoji.gemspec`), and every
  registry should end up on the same number. If only some targets are
  already taken, say which ones and let Sam choose.
- **A target isn't logged in.** Sam has to log in himself (see step 4); you
  can't do it for him.
- **Python build/twine is missing.** Install with
  `python -m pip install --user build twine`. That's a dev tool, not a
  runtime dependency, so it's fine.

Mention uncommitted changes, but they don't block. Package READMEs load the
Made in Baltimore badge from GitHub `main`, so if the badge image changed and
isn't pushed, say so.

## 2. Test all three

Run all three suites, even if only one package is being deployed, since they
have to stay identical:

```sh
(cd npm && npm test)
(cd python && python -m unittest discover tests)
(cd ruby && ruby spec/tsukimoji_spec.rb)
```

If any of them fails, stop and don't publish anything.

## 3. Build fresh, then check

Delete old build output first so a stale version can't get uploaded:

```sh
rm -rf python/dist python/build python/src/*.egg-info ruby/*.gem
(cd npm && npm pack --dry-run)
(cd python && python -m build && python -m twine check dist/*)
(cd ruby && gem build tsukimoji.gemspec)
```

Check that the npm file list is `index.js`, `index.mjs`, `index.d.ts`,
`README.md`, `LICENSE` and `package.json`, and that every artefact has the
expected version in its name. The setuptools licence deprecation warning
and the gem warning about `homepage_uri` and `source_code_uri` are known
and harmless.

## 4. Publish

Do the targets one at a time, and confirm each one (step 5) before moving
to the next. If one fails, stop and report. Don't skip ahead.

### npm

Sam's account has 2FA on writes. Run it in the background so the
browser-approval link can be passed on:

```sh
cd npm && npm publish --auth-type=web
```

Read the task output. If it prints an `https://www.npmjs.com/auth/...` URL,
give it to Sam to approve. Sometimes it publishes straight away if he
approved recently. Success looks like `+ tsukimoji@<version>`. If it says
`EOTP`, Sam can run `npm publish --otp=<code>` in his own terminal instead.
Not logged in: Sam runs `npm login`.

### PyPI

```sh
cd python && python -m twine upload --non-interactive dist/*
```

`--non-interactive` makes it fail instead of hanging on a password prompt.
It needs an API token in `~/.pypirc`
(`[pypi]` / `username = __token__` / `password = pypi-...`) or in
`TWINE_USERNAME=__token__` + `TWINE_PASSWORD`. Sam creates the token at
pypi.org → Account settings → API tokens. Before the project exists it
has to be account-scoped, and afterwards it can be scoped to `tsukimoji`.
Never put a token in the repo, and never ask Sam to paste it into chat.
He should put it in `~/.pypirc` himself.

### RubyGems

```sh
cd ruby && gem push tsukimoji-<version>.gem
```

If the account has MFA, `gem push` asks for an OTP and would hang in the
background. Ask Sam for a fresh code and run
`gem push tsukimoji-<version>.gem --otp <code>` straight away, since codes
last about 30s. Or he can run it himself. Not signed in: Sam runs
`gem signin`.

## 5. Confirm on the registry

A successful exit isn't proof. Poll until the registry serves the new
version. A new version often takes 20–60s to show up:

```sh
v=<version>
for i in $(seq 1 36); do
  [ "$(curl -s -o /dev/null -w '%{http_code}' "https://registry.npmjs.org/tsukimoji/$v")" = 200 ] && { echo "npm $v live after ~$((i*5))s"; break; }
  sleep 5
done
```

Use the same loop for PyPI (`https://pypi.org/pypi/tsukimoji/$v/json`) and
RubyGems (`https://rubygems.org/api/v2/rubygems/tsukimoji/versions/$v.json`).
Don't trust `npm view`, because it caches.

## 6. Clean up and report

```sh
rm -rf python/dist python/build python/src/*.egg-info ruby/*.gem
```

Report each target with its version and package page:

- https://www.npmjs.com/package/tsukimoji
- https://pypi.org/project/tsukimoji/
- https://rubygems.org/gems/tsukimoji

Include any warnings worth fixing. Then offer to commit and push, and to tag
the release (`v<version>`). Don't do either unless Sam asks.
