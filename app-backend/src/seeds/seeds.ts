import { config } from 'dotenv';
config();

import { AppDataSource } from '../data-source';

async function runSeeds(){

    await AppDataSource.initialize();
}

runSeeds().catch((err) => {
    console.error('Erro ao correr seeds:', err);
    process.exit(1);
});
