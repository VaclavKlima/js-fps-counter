(() => {
    if (window.trustedTypes && window.trustedTypes.createPolicy && !window.trustedTypes.defaultPolicy) {
        window.trustedTypes.createPolicy('default', {
            createHTML: string => string
            // Optional, only needed for script (url) tags
            //,createScriptURL: string => string
            //,createScript: string => string,
        });
    }

    let element = document.createElement('div');
    let frames = new Array(60).fill(0);
    let fpsLow = 60;
    let fpsHigh = 0;
    let fpsPercentile = new Set();

    // set id attribute to the element
    element.id = 'fps-counter';

    // add inner elements to the element
    element.innerHTML = '<div>Current Fps: <span id="current-fps">60</span></div>' +
        '<div>Low: <span id="fps-low">60</span></div>' +
        '<div>High: <span id="fps-high">0</span></div>' +
        '<div>10th percentile: <span id="fps-percentile-10">0</span></div>' +
        '<div>80th percentile: <span id="fps-percentile-80">0</span></div>' +
        '<div>99th percentile: <span id="fps-percentile-99">0</span></div>' +
        '<div>Median: <span id="fps-median">0</span></div>';

    // add style to the element
    element.style.position = 'fixed';
    element.style.top = '1rem';
    element.style.left = '1rem';
    element.style.width = 'auto';
    element.style.height = 'auto';
    element.style.backgroundColor = 'rgba(0,0,0,0.8)';
    element.style.color = 'white';
    element.style.padding = '10px';
    element.style.fontSize = '16px';
    element.style.zIndex = '9999';

    document.body.appendChild(element);

    let currentFpsEl = document.getElementById('current-fps');
    let fpsLowEl = document.getElementById('fps-low');
    let fpsHighEl = document.getElementById('fps-high');
    let fpsPercentile10El = document.getElementById('fps-percentile-10');
    let fpsPercentile80El = document.getElementById('fps-percentile-80');
    let fpsPercentile99El = document.getElementById('fps-percentile-99');
    let medianEl = document.getElementById('fps-median');

    async function startFpsCounter() {
        while (true) {
            frames.shift();
            frames.push(performance.now());
            let fps = Math.round(1000 / ((frames[frames.length - 1] - frames[0]) / frames.length));

            fpsLow = Math.min(fpsLow, fps);
            fpsHigh = Math.max(fpsHigh, fps);
            fpsPercentile.add(fps);


            currentFpsEl.innerText = fps;
            fpsLowEl.innerHTML = fpsLow;
            fpsHighEl.innerHTML = fpsHigh;

            countpercentile(80).then((percentile) => {
                fpsPercentile80El.innerHTML = percentile;
            })

            countpercentile(99).then((percentile) => {
                fpsPercentile99El.innerHTML = percentile;
            })

            countpercentile(10).then((percentile) => {
                fpsPercentile10El.innerHTML = percentile;
            })

            countMedian();

            await new Promise(resolve => setTimeout(resolve, 1000 / 60));
        }
    }

    async function countpercentile(percentile = 80) {
        // calculate 80th percentile
        let fpsArray = Array.from(fpsPercentile);

        // sort the array
        fpsArray.sort((a, b) => a - b);

        // get the 80th percentile value
        let index = Math.floor(fpsArray.length * (percentile / 100));

        return fpsArray[index];
    }
    
    async function countMedian() {
        // calculate median
        let fpsArray = Array.from(fpsPercentile);

        // sort the array
        fpsArray.sort((a, b) => a - b);

        // get the median value
        let index = Math.floor(fpsArray.length / 2);

        medianEl.innerHTML = fpsArray[index];
    }

    startFpsCounter();


    // every 10 seconds clear the fpsPercentile set to avoid memory leak, remove only old values
    setInterval(() => {
        let fpsArray = Array.from(fpsPercentile);
        let index = Math.floor(fpsArray.length * 0.1);
        console.log('Removing ' + index + ' elements');
        console.log('Keeping ' + (fpsArray.length - index) + ' elements');
        fpsArray.splice(0, index);
        fpsPercentile = new Set(fpsArray);
    }, 10000);

})();