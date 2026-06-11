require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'HoneAppIntents'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = 'MIT'
  s.author         = 'Hone'
  s.homepage       = 'https://example.com'
  s.platforms      = { :ios => '16.0' }
  s.swift_version  = '5.7'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,swift}"
  s.frameworks = 'AppIntents'
  s.resource_bundles = {
    'HoneAppIntents_Privacy' => ['PrivacyInfo.xcprivacy']
  }
end
