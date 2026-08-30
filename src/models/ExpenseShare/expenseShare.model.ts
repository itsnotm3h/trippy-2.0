import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/db";

class ExpenseShare extends Model {
  declare shareId: number;
  declare expenseId: number;
  declare userId: number;
  declare shareAmount: number;
  static associate(models: any) {
    ExpenseShare.belongsTo(models.Expenses, {
      foreignKey: "expenseId",
      as: "expenses",
    });
    ExpenseShare.belongsTo(models.Users, { foreignKey: "userId", as: "users" });
  }
}

ExpenseShare.init(
  {
    shareId: {
      type: DataTypes.INTEGER,
      field: "share_id",
      primaryKey: true,
      autoIncrement: true,
    },
    expenseId: {
      type: DataTypes.INTEGER,
      field: "expense_id",
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
      allowNull: false,
    },
    shareAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: "share_amount",
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "expense_shares",
    underscored: true,
  },
);

export default ExpenseShare;
