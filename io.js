import { io } from 'https://cdn.jsdelivr.net/npm/socket.io-client@4.4.0/dist/socket.io.esm.min.js';


const PROXY = (HostName => {
    HostName = HostName.split(".");
    HostName[0] = "proxy";
    return HostName.join(".");
})(window.location.hostname);


const socket = io((url => {
    const { pathname } = window.location;
    url.hostname = PROXY;
    url.pathname = pathname.startsWith('/utils') ? '/' : pathname.split("/")[1];
    url = url.toString();
    console.log(url);
    return url;
})(new URL(window.location)), {
    transports: ['websocket'],
});

export default socket;
