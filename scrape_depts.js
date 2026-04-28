process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');
const fs = require('fs');

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
};

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

async function scrape() {
    try {
        console.log('Fetching programmes page...');
        const html = await fetchUrl('https://rvce.edu.in/programmes/');
        
        // Extract links to departments.
        const links = [];
        const regex = /href="([^"]+)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
            const link = match[1];
            if (link.includes('rvce.edu.in') && !links.includes(link) && 
                !link.includes('.pdf') && !link.includes('.png') && !link.includes('.jpg') && !link.includes('.css') && !link.includes('.js')) {
                links.push(link);
            }
        }
        
        fs.writeFileSync('links.json', JSON.stringify(links, null, 2));
        console.log(`Found ${links.length} unique links.`);
        
        // Let's print out the links that look like departments
        const deptLinks = links.filter(l => l.match(/department|engineering|science/i));
        console.log('Potential Department Links:');
        deptLinks.forEach(l => console.log(l));
        
    } catch (e) {
        console.error(e);
    }
}

scrape();
