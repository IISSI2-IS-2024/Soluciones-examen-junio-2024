import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { BaseReporter } from '@jest/reporters'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

class TestsCSVReporter extends BaseReporter {
  constructor (globalConfig, options) {
    super(globalConfig, options)
    this._globalConfig = globalConfig
    this._options = options
    this._testFiles = {}
    this._testResults = []
  }

  onTestResult (test, testResult, aggregatedResult) {
    const fileName = path.basename(testResult.testFilePath)
    if (!this._testFiles[fileName]) {
      this._testFiles[fileName] = {
        total: 0,
        passed: 0,
        failed: 0,
        duration: 0
      }
    }

    const file = this._testFiles[fileName]
    file.total += testResult.numFailingTests + testResult.numPassingTests
    file.passed += testResult.numPassingTests
    file.failed += testResult.numFailingTests

    testResult.testResults.forEach(({ fullName, duration, status }) => {
      file.duration += duration
      this._testResults.push({
        file: fileName,
        test: fullName,
        duration,
        status
      })
    })
  }

  onRunComplete (contexts, results) {
    const totalTests = Object.values(this._testFiles).reduce((total, file) => total + file.total, 0)
    const totalPassed = Object.values(this._testFiles).reduce((total, file) => total + file.passed, 0)
    const totalFailed = Object.values(this._testFiles).reduce((total, file) => total + file.failed, 0)
    const totalDuration = Object.values(this._testFiles).reduce((total, file) => total + file.duration, 0)
    const averageDuration = totalTests > 0 ? (totalDuration / totalTests).toFixed(2) : 0

    const summary = `Total Tests: ${totalTests}, Passed Tests: ${totalPassed}, Failed Tests: ${totalFailed}, Average Duration: ${averageDuration}ms`

    const filesSummary = Object.entries(this._testFiles)
      .map(([file, { total, passed, failed, duration }]) => `${file}: Total: ${total}, Passed: ${passed}, Failed: ${failed}, Average Duration: ${total > 0 ? (duration / total).toFixed(2) : 0}ms`)
      .join('\n')

    const testResults = this._testResults
      .map(({ file, test, duration, status }) => `${file},${test},${duration},${status}`)
      .join('\n')

    const outputDir = this._options.outputDir
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir)
    }

    const fileName = 'testResults.csv'
    writeFileSync(`${outputDir}/${fileName}`, `${summary}\n\nFiles Summary:\n${filesSummary}\n\nTest Results:\nFile,Test,Duration,Status\n${testResults}`)

    console.log(`Test results saved to ${fileName}`)
  }
}

export default TestsCSVReporter
