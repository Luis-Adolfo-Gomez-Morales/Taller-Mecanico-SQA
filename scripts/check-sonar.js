const fs = require('node:fs');

async function comprobar() {
    const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const sha = event.pull_request?.head.sha || process.env.GITHUB_SHA;
    const url = `https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/commits/${sha}/check-runs`;
    for (let intento = 0; intento < 30; intento++) {
        const response = await fetch(url, { headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json'
        } });
        if (!response.ok) throw new Error(`No se pudo consultar SonarQube: HTTP ${response.status}`);
        const data = await response.json();
        const sonar = data.check_runs.find(check => check.name === 'SonarCloud Code Analysis');
        if (sonar?.status === 'completed') {
            console.log(`SonarQube: ${sonar.conclusion}. ${sonar.details_url}`);
            if (sonar.conclusion !== 'success') throw new Error('SonarQube no aprobo el cambio.');
            return;
        }
        console.log('Esperando el resultado de SonarQube para este cambio...');
        await new Promise(resolve => setTimeout(resolve, 10000));
    }
    throw new Error('SonarQube no envio un resultado. Revisar la integracion del repositorio.');
}
comprobar().catch(error => { console.error(error.message); process.exitCode = 1; });
