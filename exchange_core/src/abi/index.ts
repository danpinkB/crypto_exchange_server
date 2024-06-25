import fs from 'fs'

const ERC_20_ABI = JSON.parse(fs.readFileSync(`./static/ERC20.abi`, 'utf8'))
const ERC_20_POLYGON_ABI = JSON.parse(fs.readFileSync(`./static/ERC20_POLYGON.abi`, 'utf8'))

export { ERC_20_ABI, ERC_20_POLYGON_ABI }