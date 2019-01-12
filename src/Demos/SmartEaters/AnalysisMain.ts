import { EaterAnalysis } from "./EaterAnalysis";

// styling
document.body.style.padding = '0';
document.body.style.margin = '0';

document.addEventListener('DOMContentLoaded', async () => {
    if (location.search.indexOf('?b=') !== -1) {
        const blob = location.search.split('?b=')[1];

        const analysis = await EaterAnalysis.fromBlob(blob);
        const cnv = analysis.domElement;
        cnv.style.display = 'block';
        document.body.appendChild(cnv);
        analysis.start();
    };
});