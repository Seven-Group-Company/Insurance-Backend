pipeline {
    agent {
        label 'win-agent'
    }
    triggers {
        pollSCM '* * * * *'
    }
    environment {
      scannerHome = tool name: 'sonarscanner'
      EC2_INSTANCE_IP = 'EC2_INSTANCE_IP'
      SSH_KEY_ID = 'sgc_ssh_pk'
      SSH_USER = 'ubuntu'
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

    stage('SSH into EC2 Instance') {
      steps {
        script {
          // Use SSH Agent plugin to authenticate with SSH key
          sshagent([SSH_KEY_ID]) {
            sh """
                        ssh -o StrictHostKeyChecking=no ${SSH_USER}@${EC2_INSTANCE_IP} << EOF
                            echo "Successfully logged into EC2 instance!"
                            # Run any commands you need here, e.g., update, start services, etc.
                            uptime
                            ll
                        EOF
                        """
          }
        }
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
