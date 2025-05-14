export const nanoid = (size = 21) => {
    const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
    let id = ''
    let i = size | 0
    while (i--) {
        id += urlAlphabet[(Math.random() * urlAlphabet.length) | 0]
    }
    return id
}