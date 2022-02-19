import router from './Router.js';
import { exec } from "child_process";

const br = '<br/>';

router.get('/ps', (req, res) => exec("ps aux  --sort -rss", (...args) =>
    res.send(args.filter(x => x).join(br).replace('\n', br) + `
<script>
    setTimeout(()=> window.location.reload(1), 1000);
</script>`)));
