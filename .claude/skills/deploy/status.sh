#!/usr/bin/env bash
# Pre-flight report for /deploy: local versions, what each registry already
# has, and whether we're logged in. Read-only, publishes nothing.
# Run from the repo root.

set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

npm_v=$(sed -n 's/^ *"version": "\(.*\)",/\1/p' npm/package.json | head -1)
py_v=$(sed -n 's/^version = "\(.*\)"/\1/p' python/pyproject.toml | head -1)
init_v=$(sed -n 's/^__version__ = "\(.*\)"/\1/p' python/src/tsukimoji/__init__.py | head -1)
gem_v=$(sed -n 's/^ *spec.version *= "\(.*\)"/\1/p' ruby/tsukimoji.gemspec | head -1)

echo "== Local versions"
echo "npm/package.json            $npm_v"
echo "python/pyproject.toml       $py_v"
echo "python/.../__init__.py      $init_v"
echo "ruby/tsukimoji.gemspec      $gem_v"
if [ "$npm_v" = "$py_v" ] && [ "$py_v" = "$init_v" ] && [ "$init_v" = "$gem_v" ]; then
  echo "OK: all four match"
else
  echo "MISMATCH: versions differ, fix before deploying"
fi
v=$npm_v

code() { curl -s -o /dev/null -w '%{http_code}' -m 15 "$1"; }

echo
echo "== Is $v already published? (200 = taken, 404 = free)"
echo "npm       $(code "https://registry.npmjs.org/tsukimoji/$v")"
echo "PyPI      $(code "https://pypi.org/pypi/tsukimoji/$v/json")"
echo "RubyGems  $(code "https://rubygems.org/api/v2/rubygems/tsukimoji/versions/$v.json")"

echo
echo "== Latest on each registry"
echo "npm       $(curl -s -m 15 "https://registry.npmjs.org/tsukimoji/latest" | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')"
echo "PyPI      $(curl -s -m 15 "https://pypi.org/pypi/tsukimoji/json" | sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' | head -1)"
echo "RubyGems  $(curl -s -m 15 "https://rubygems.org/api/v1/versions/tsukimoji/latest.json" | sed -n 's/.*"version":"\([^"]*\)".*/\1/p')"

echo
echo "== Logins"
echo "npm       $(npm whoami 2>/dev/null || echo 'NOT logged in (npm login)')"
if [ -n "${TWINE_PASSWORD:-}" ] || [ -f "$HOME/.pypirc" ]; then
  echo "PyPI      token found (~/.pypirc or TWINE_PASSWORD)"
else
  echo "PyPI      NO token (needs ~/.pypirc or TWINE_PASSWORD)"
fi
if [ -f "$HOME/.gem/credentials" ] || [ -f "$HOME/.local/share/gem/credentials" ] || [ -n "${GEM_HOST_API_KEY:-}" ]; then
  echo "RubyGems  credentials found"
else
  echo "RubyGems  NOT signed in (gem signin)"
fi

echo
echo "== Build tools"
python -c "import build, twine" 2>/dev/null && echo "python build + twine  OK" \
  || echo "python build + twine  MISSING (python -m pip install --user build twine)"

echo
echo "== Git"
git status -sb | head -1
git status --short
