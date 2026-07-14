// import path from 'path';
import { ensureGlobalVault } from '../src/utils/global';
// const targetProjectDirectory = path.resolve(__dirname, '../');
globalThis.__XALOR_COMPILE_LOCK__ = true;
ensureGlobalVault();
