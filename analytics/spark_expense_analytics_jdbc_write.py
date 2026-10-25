from pyspark.sql import SparkSession
from pyspark.sql.functions import col, date_format, sum as spark_sum, count, avg
from pyspark.sql.window import Window
import os

spark = SparkSession.builder \
    .appName("ExpenseFlowAnalyticsJDBC") \
    .config("spark.jars", r"C:\Users\alesh\.m2\repository\com\mysql\mysql-connector-j\8.3.0\mysql-connector-j-8.3.0.jar") \
    .getOrCreate()

url = "jdbc:mysql://localhost:3306/expenseflow"
props = {
    "user": "expenseflow_app",
    "password": "Sindhuja_2535",
    "driver": "com.mysql.cj.jdbc.Driver"
}

query = "(SELECT e.id, e.user_id, e.amount, c.name AS category, e.date AS expense_date FROM expenses e LEFT JOIN categories c ON c.id = e.category_id WHERE e.date IS NOT NULL) t"

df = spark.read.format("jdbc") \
    .option("url", url) \
    .option("dbtable", query) \
    .options(**props) \
    .load()

monthly = df.withColumn("month", date_format(col("expense_date"), "yyyy-MM")) \
    .groupBy("month") \
    .agg(
        spark_sum("amount").alias("total_spent"),
        count("*").alias("transactions"),
        avg("amount").alias("avg_expense")
    ) \
    .orderBy("month")

category = df.groupBy(col("category")) \
    .agg(
        spark_sum("amount").alias("total_spent"),
        count("*").alias("transactions"),
        avg("amount").alias("avg_expense")
    ) \
    .orderBy(col("total_spent").desc())

monthly.show(truncate=False)
category.show(truncate=False)

# Write back to MySQL tables (overwrite)
monthly.write.format("jdbc") \
    .option("url", url) \
    .option("dbtable", "analytics_monthly_trends") \
    .option("truncate", "true") \
    .options(**props) \
    .mode("overwrite") \
    .save()

category.write.format("jdbc") \
    .option("url", url) \
    .option("dbtable", "analytics_category_trends") \
    .option("truncate", "true") \
    .options(**props) \
    .mode("overwrite") \
    .save()

# Also write to analytics/output for frontend consumption
outdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
monthly.coalesce(1).write.mode("overwrite").option("header", "true").csv(os.path.join(outdir, "monthly_trends"))
category.coalesce(1).write.mode("overwrite").option("header", "true").csv(os.path.join(outdir, "category_trends"))

spark.stop()
