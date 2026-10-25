@echo off
setlocal
set HADOOP_HOME=C:\hadoop
set PATH=%HADOOP_HOME%\bin;%PATH%
set JAVA_HOME=C:\tools\jdk-17.0.16+8
set PATH=%JAVA_HOME%\bin;%PATH%
set SPARK_HOME=C:\Users\alesh\AppData\Local\Programs\Python\Python313\Lib\site-packages\pyspark
set PATH=%SPARK_HOME%\bin;%PATH%
set PYSPARK_PYTHON=py
set PYSPARK_DRIVER_PYTHON=py

"%SPARK_HOME%\bin\spark-submit.cmd" ^
  --conf spark.hadoop.fs.file.impl=org.apache.hadoop.fs.RawLocalFileSystem ^
  --conf spark.hadoop.io.native.lib.available=false ^
  --conf spark.ui.enabled=false ^
  --conf spark.driver.extraJavaOptions=-Dorg.apache.hadoop.util.NativeCodeLoader.enabled=false ^
  --conf spark.executor.extraJavaOptions=-Dorg.apache.hadoop.util.NativeCodeLoader.enabled=false ^
  --jars "C:\Users\alesh\.m2\repository\com\mysql\mysql-connector-j\8.3.0\mysql-connector-j-8.3.0.jar" ^
  "%~dp0spark_expense_analytics_jdbc_only.py" 2>&1 | findstr /V "ERROR\|Exception\|UnsatisfiedLinkError\|ShutdownHook\|DiskBlockManager\|ThreadPoolExecutor"
exit /b 0
