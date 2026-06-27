import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/db";


class UserSession extends Model {
    declare sessionId: number;
    declare userId: number;
    declare token: string;
    declare expireAt: Date;
    declare isRevoked: boolean;
    declare deviceInfo: string;
}

UserSession.init({
    sessionId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    authId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expireAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isRevoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false

    },
    deviceInfo: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},
    {
        sequelize,
        tableName: "user_session",
        timestamps: true,
        updatedAt: "updatedAt",
        createdAt: "createdAt",
        underscored: true,
    },

)


export default UserSession;