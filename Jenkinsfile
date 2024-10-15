pipeline {
    agent {
        label 'win-agent'
    }
    triggers {
        pollSCM '* * * * *'
    }
    environment {
      scannerHome = tool name: 'sonarscanner'
    }
    stages {
        stage('Install Packages') {
      steps {
        echo 'Install Dependencies'
        sh 'npm install'
      }
        }

        stage('Test') {
      steps {
        sh 'npm run test'
      }
        }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('sonarqube_server') {
          bat "${scannerHome}\\bin\\sonar-scanner"
        }
      }
    }

    stage('CleanUp WS') {
      steps {
        cleanWs()
      }
    }
    }
}
