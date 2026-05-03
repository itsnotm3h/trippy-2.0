import { Model, DataTypes, DecimalDataType } from "sequelize";
import sequelize from "../../config/db";

class ExpenseShare extends Model {
  declare shareId: number;
  declare expenseId: number;
  declare userId: number;
  declare shareAmount: DecimalDataType;
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
  },
  {
    sequelize,
    tableName: "expense_share",
  },
);

export default ExpenseShare;
