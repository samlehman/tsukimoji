# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "tsukimoji"
  spec.version       = "0.1.0"
  spec.authors       = ["Samuel"]
  spec.email         = ["grieve@gmail.com"]

  spec.summary       = "Moon phase emoji for any date"
  spec.description   = "Tsukimoji computes the current (or any) lunar phase and " \
                        "returns the matching emoji, phase name, age in days, " \
                        "and illumination fraction."
  spec.homepage      = "https://github.com/samlehman/tsukimoji"
  spec.license       = "MIT"
  spec.required_ruby_version = ">= 2.7"

  spec.metadata["homepage_uri"]    = spec.homepage
  spec.metadata["source_code_uri"] = spec.homepage

  spec.files         = Dir["lib/**/*.rb"] + ["README.md"]
  spec.require_paths = ["lib"]
end
