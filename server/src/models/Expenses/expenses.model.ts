import { Model, DataTypes, DecimalDataType } from "sequelize";
import sequelize from "../../config/db";

class Expenses extends Model {
  declare expenseId: number;
  declare payerId: number;
  declare tripId: number;
  declare amount: DecimalDataType;
  declare description: string;
  declare comments: string;
  declare category: string;
  declare type: string;
  declare expenseDate: Date;
  static associate(models: any) {
    Expenses.belongsTo(models.Trip, { foreignKey: "tripId", as: "trip" });
    Expenses.belongsTo(models.Users, {
      foreignKey: "payerId",
      targetKey: "userId",
      as: "payer",
    });
    Expenses.hasMany(models.ExpenseShare, {
      foreignKey: "expenseId",
      as: "expenseShare",
    });
  }
}

Expenses.init(
  {
    expenseId: {
      type: DataTypes.INTEGER,
      field: "expense_id",
      autoIncrement: true,
      primaryKey: true,
    },
    payerId: {
      type: DataTypes.INTEGER,
      field: "payer_id",
      allowNull: false,
    },
    tripId: {
      type: DataTypes.INTEGER,
      field: "trip_id",
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comments: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM(
        "Activities",
        "Shopping",
        "Transport",
        "Food",
        "Stay",
        "Misc",
      ),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Solo", "Group"),
      allowNull: false,
    },
    expenseDate: {
      type: DataTypes.DATE,
      field: "expense_date",
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "expenses",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
  },
);

export default Expenses;
