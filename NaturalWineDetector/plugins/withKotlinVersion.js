/**
 * Config plugin to pin Kotlin Gradle plugin to 1.9.25.
 *
 * React Native 0.76.1's version catalog sets kotlin = "1.9.24",
 * but expo-modules-core's Compose compiler 1.5.15 requires >= 1.9.25.
 * This plugin adds an explicit version to the classpath dependency
 * so Gradle resolves the correct Kotlin version.
 */
const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withKotlinVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin')",
      "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.25')"
    );
    return config;
  });
};
