pipeline {
  agent any
  stages {
    stage('Checkout code') {
      steps {
        git(url: 'https://github.com/Seven-Group-Company/Insurance-Backend', branch: 'develop')
      }
    }

    stage('Log') {
      steps {
        sh 'ls -a'
      }
    }

  }
}