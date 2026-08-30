import { Model, DataTypes, DecimalDataType } from "sequelize"
import sequelize from "../config/db";


class Settlements extends Model {
    declare settlementId: number;
    declare tripId: number;
    declare payerId: number;
    declare payeeId: number;
    declare amount: DecimalDataType;
    declare isConfirmed: boolean;
    static associate(models:any) {
        Settlements.belongsTo(models.Trip, { foreignKey: 'tripId', as:"trip" });
        Settlements.belongsTo(models.Users, { foreignKey: 'payerId', targetKey:"userId",as:"usersPayer"})
        Settlements.belongsTo(models.Users, { foreignKey: 'payeeId', targetKey:"userId",as:"userPayee"})
    }
}

Settlements.init({
    settlementId: {
        type: DataTypes.INTEGER,
        field: "settlement_id",
        primaryKey: true,
        autoIncrement: true
    },
    tripId: {
        type: DataTypes.INTEGER,
        field: "trip_id",
        allowNull: false
    },
    payerId: {
        type: DataTypes.INTEGER,
        field: "payer_id",
        allowNull: false
    },
    payeeId: {
        type: DataTypes.INTEGER,
        field: "payee_id",
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0.00
    },
    isConfirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "settlements",
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
})

export default Settlements;