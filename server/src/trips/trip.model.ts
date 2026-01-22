import { Model, DataTypes, DecimalDataType } from "sequelize"
import sequelize from "../config/db";

class Trip extends Model {
    declare tripId: number;
    declare title: string;
    declare type: string;
    declare country: string;
    declare currencyRate:DecimalDataType;
    declare startDate: Date;
    declare endDate: Date;
    declare leaderId: number;
    declare isActive: boolean;
    declare isDeleted: boolean;
}

Trip.init(
    {
        tripId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull:false,
        },
        type:{
            type: DataTypes.STRING,
            allowNull:false,
        },
        country:{
            type: DataTypes.STRING,
            allowNull:false,
        },
        currencyRate:{
            type: DataTypes.DECIMAL,
            allowNull:false,
        },
        startDate:{
            type: DataTypes.DATE,
            allowNull:false,
        },
        endDate:{
            type: DataTypes.DATE,
            allowNull:false,
        },
        leaderId:{
            type: DataTypes.NUMBER,
            allowNull:false,
        },
        isActive:{
            type: DataTypes.BOOLEAN,
            allowNull:false,
        },
        isDeleted:{
            type: DataTypes.BOOLEAN,
            allowNull:false,
        },
    },
    {
        sequelize,
        modelName: 'trip',
        tableName: 'trips',
        timestamps: true,
        updatedAt: false,
        createdAt: 'created_at',
    }
)

export default Trip;