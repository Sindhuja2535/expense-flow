from pyspark.sql import SparkSession
from pyspark.sql.functions import col, date_format, sum as spark_sum, avg, count

spark = SparkSession.builder.appName("ExpenseAnalytics").getOrCreate()

df = spark.read.option("header", True).option("inferSchema", True).csv("expenses.csv")

monthly = df.groupBy(date_format(col("expense_date"), "yyyy-MM").alias("month")) \
    .agg(spark_sum("amount").alias("total_spent"), count("*").alias("transactions"), avg("amount").alias("avg_expense"))

category = df.groupBy("category") \
    .agg(spark_sum("amount").alias("total_spent"), count("*").alias("transactions")) \
    .orderBy(col("total_spent").desc())

monthly.show()
category.show()

monthly.coalesce(1).write.mode("overwrite").option("header", True).csv("output/monthly_trends")
category.coalesce(1).write.mode("overwrite").option("header", True).csv("output/category_trends")

spark.stop()
