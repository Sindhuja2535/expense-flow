from pyspark.sql import SparkSession
from pyspark.sql.functions import col, date_format, sum as spark_sum, avg, count

spark = SparkSession.builder.appName("ExpenseAnalyticsJDBC") \
    .config("spark.jars", r"C:\Users\alesh\.m2\repository\com\mysql\mysql-connector-j\8.3.0\mysql-connector-j-8.3.0.jar") \
    .getOrCreate()

query = "(SELECT e.id, e.user_id, e.amount, c.name AS category, e.date AS expense_date FROM expenses e LEFT JOIN categories c ON c.id = e.category_id) t"

df = (spark.read.format("jdbc")
      .option("url", "jdbc:mysql://localhost:3306/expenseflow")
      .option("dbtable", query)
      .option("user", "expenseflow_app")
      .option("password", "Sindhuja_2535")
      .option("driver", "com.mysql.cj.jdbc.Driver")
      .load())

monthly = df.groupBy(date_format(col("expense_date"), "yyyy-MM").alias("month")) \
    .agg(spark_sum("amount").alias("total_spent"), count("*").alias("transactions"), avg("amount").alias("avg_expense")) \
    .orderBy(col("month"))

category = df.groupBy("category") \
    .agg(spark_sum("amount").alias("total_spent"), count("*").alias("transactions")) \
    .orderBy(col("total_spent").desc())

monthly.show()
category.show()

monthly.coalesce(1).write.mode("overwrite").option("header", True).csv("output/monthly_trends_jdbc")
category.coalesce(1).write.mode("overwrite").option("header", True).csv("output/category_trends_jdbc")

spark.stop()
