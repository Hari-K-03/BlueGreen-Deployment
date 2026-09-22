pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'hariprathyumnank/bluegreen-app'
        GREEN_PORT = '3002'
        PROXY_PORT = '8081'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE%:%BUILD_NUMBER% .'
                bat 'docker tag %DOCKER_IMAGE%:%BUILD_NUMBER% %DOCKER_IMAGE%:latest'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USERNAME',
                    passwordVariable: 'DOCKER_PASSWORD'
                )]) {
                    bat 'docker login -u %DOCKER_USERNAME% -p %DOCKER_PASSWORD%'
                    bat 'docker push %DOCKER_IMAGE%:%BUILD_NUMBER%'
                    bat 'docker push %DOCKER_IMAGE%:latest'
                }
            }
        }

        stage('Deploy Green') {
            steps {
                bat 'docker rm -f green 2>NUL || exit 0'
                bat 'docker run -d --name green -p %GREEN_PORT%:3000 -e VERSION=Green %DOCKER_IMAGE%:%BUILD_NUMBER%'
            }
        }

        stage('Test Green') {
            steps {
                bat 'curl --fail http://localhost:%GREEN_PORT%/health'
            }
        }

        stage('Switch Traffic to Green') {
            steps {
                bat '''
                (
                echo events {}
                echo.
                echo http {
                echo     upstream app {
                echo         server host.docker.internal:3002;
                echo     }
                echo.
                echo     server {
                echo         listen 80;
                echo.
                echo         location / {
                echo             proxy_pass http://app;
                echo         }
                echo     }
                echo }
                ) > nginx\\nginx.conf
                '''

                bat 'docker exec bluegreen-proxy nginx -s reload'
            }
        }

    }
}