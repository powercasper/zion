node('default') {
    
    stage('Build Nark Container') {
        deleteDir()
        checkout scm
        sh 'ci/build.sh'
    }

    stage('Deploy to Integration') {
        timeout(time: 1, unit: 'HOURS') {
            input "Deploy to INTEGRATION"
        }
        milestone()
        try {
            withCredentials([[$class: 'StringBinding', credentialsId: 'newrelic-deploy', variable: 'API_KEY']]) {
                sh "ci/deploy.sh"
                slackSend (color: '#00FF00', channel: '#platform-team', message: "*${env.JOB_NAME} [${env.BUILD_NUMBER}]*\n${env.BUILD_URL}\nDeployed to integration.")
                slackSend (color: '#00FF00', channel: '#set', message: "*${env.JOB_NAME} [${env.BUILD_NUMBER}]*\n${env.BUILD_URL}\nDeployed to integration.")
            }
        } catch (e) {
            currentBuild.result = "FAILED"
            slackSend (color: '#FF0000', channel: '#platform-team', message: "*FAILED: ${env.JOB_NAME} [${env.BUILD_NUMBER}]*\n${env.BUILD_URL}\nFailed integration deploy.")
            slackSend (color: '#FF0000', channel: '#set', message: "*FAILED: ${env.JOB_NAME} [${env.BUILD_NUMBER}]*\n${env.BUILD_URL}\nFailed integration deploy.")
            throw e
        }
    }
}

