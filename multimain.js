console.log('Main called')
global.Children = require('./main');
setTimeout(() => {
    const a = Children.spawn(10)
    console.log(a);
}, 3000)

console.log('Main Finished')
