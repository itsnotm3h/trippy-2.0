import { CONFIG } from './env'; // No extension!
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    CONFIG.DB_NAME!,
    CONFIG.DB_USER!,
    CONFIG.DB_PASSWORD!,
    {
        host: CONFIG.DB_HOST,
        port:Number(CONFIG.DB_PORT),
        dialect: 'mariadb',
        dialectOptions:{allowPublicKeyRetrieval: true,},
        logging: console.log,
        define: {
            underscored: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }

)

export default sequelize;