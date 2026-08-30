import { Model, DataTypes, DecimalDataType } from "sequelize"
import sequelize from "../config/db";

class PersonalBudget extends Model {
    declare budgetId: number;
    declare tripId: number;
    declare userId: number;
    declare budget: DecimalDataType;
    declare food: DecimalDataType;
    declare transport: DecimalDataType;
    declare stay: DecimalDataType;
    declare activities: DecimalDataType;
    declare shopping: DecimalDataType;
    declare misc: DecimalDataType;

    static associate(models:any) {
        PersonalBudget.belongsTo(models.Trip, { foreignKey: 'tripId', as:"trip" });
        PersonalBudget.belongsTo(models.Users, { foreignKey: 'userId', as:"users"})
    }
}

PersonalBudget.init({
    budgetId: {
        type: DataTypes.INTEGER,
        field: "budget_id",
        primaryKey: true,
        autoIncrement: true
    },
    tripId: {
        type: DataTypes.INTEGER,
        field: "trip_id",
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        field: "user_id",
        allowNull: false
    },
    budget:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    },
    food:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    },
    transport:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    },
    stay:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    },
    activities:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    },
    shopping:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    },
    misc:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull:false,
        defaultValue:0.00
    }
}, {
    sequelize,
    tableName: "personal_budget"
})

export default PersonalBudget;