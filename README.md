<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
</head>
<body>
    <style>

        .navbar {
            overflow: hidden;
            background-color: #333;
            position: fixed;
            top: 0;
            width: 100%;
        }

            .navbar a {
                float: left;
                display: block;
                color: #ffffff;
                padding: 14px 16px;
                text-decoration: none;
                font-size: 17px;
                width: 100%;
                text-align: left;
            }

        .main {
            padding: 16px;
            margin-top: 30px;
            height: 1500px; /* Used in this example to enable scrolling */
        }
    </style>
    <nav class="navbar  navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span style="color:white" class="glyphicon glyphicon-th-list"></span>
                </button>
            </div>
            <div id="navbar" class="navbar-collapse collapse">
                <ul class="nav navbar-nav">
                    <li><a href="#DatareaderToList">Datareader To List</a></li>
                    <li><a href="#DatareaderToModel">Datareader To Model</a></li>
                    <li><a href="#ListToDatatable">List To Datatable</a></li>
                    <li><a href="#IListToDatatable">IList To Datatable</a></li>

                </ul>
            </div><!--/.nav-collapse -->
        </div>
    </nav>

    <div class="main" style="padding:0px 6px;">
        <div class="row">
            <!-- Get List From DataReader -->
            <div class="col-xs-12" id="DatareaderToList">
                <h3>Get List From DataReader</h3>
                <div>
                    <pre>
[System.AttributeUsage(System.AttributeTargets.Property)]
public class ExcludedAttribute : Attribute
{
}
</pre>
                </div>
                <div>
                    <pre>
public class DemoModel{
    public string DemoProperty { get; set; }
}
</pre>
                </div>
                <div>
                    <pre>
public static List<T> DataReaderMapToList<T>(IDataReader dr)
{
    List<T> list = new List<T>();
    T obj = default(T);
    while (dr.Read())
    {
        obj = Activator.CreateInstance<T>();
        foreach (PropertyInfo prop in obj.GetType().GetProperties())
        {
            ExcludedAttribute MyExcluded = (ExcludedAttribute)Attribute.GetCustomAttribute(prop, typeof(ExcludedAttribute));
            if (MyExcluded == null && (!object.Equals(dr[prop.Name], DBNull.Value)))
            {
                prop.SetValue(obj, dr[prop.Name], null);
            }
        }
        list.Add(obj);
    }
    return list;
}</pre>
                </div>
                <div>
                    <pre>
public List<DemoModel> GetDemoModelList(string DemoID)
{
    List<DemoModel> demoList = new List<DemoModel>();
    using (SqlConnection con = new SqlConnection("connectionstring"))
    {
        using (SqlCommand cmd = new SqlCommand("usp_DemoGrid", con))
        {
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@DemoID", SqlDbType.Int)).Value = Convert.ToInt32(DemoID);
            SqlParameter paramOutPut = new SqlParameter("@noOfRecords", SqlDbType.Int);
            paramOutPut.Size = 15;
            paramOutPut.Direction = ParameterDirection.Output;
            cmd.Parameters.Add(paramOutPut);
            if (cmd.Connection.State == ConnectionState.Closed)
            {
                con.Open();
            }
            var noOfRecords = 0;
            using (IDataReader dataReader = cmd.ExecuteReader())
            {
                demoList = DataReaderMapToList<DemoModel>(dataReader);
            }
            if (cmd.Parameters["@noOfRecords"].Value != DBNull.Value)
            {
                noOfRecords = Convert.ToInt32(cmd.Parameters["@noOfRecords"].Value);
            }
            else
            {
                noOfRecords = 0;
            }
            con.Close();
            return demoList;
        }
    }
}
</pre>
                </div>
            </div>

            <!-- Get Model From DataReader -->
            <div class="col-xs-12" id="DatareaderToModel">
                <h3>Get Model From DataReader</h3>
                <div>
                    <pre>
[System.AttributeUsage(System.AttributeTargets.Property)]
public class ExcludedAttribute : Attribute
{
}
</pre>
                </div>
                <div>
                    <pre>
public class DemoModel{
    public string DemoProperty { get; set; }
}
</pre>
                </div>
                <div>
                    <pre>
public static T ConvertTOEntity<T>(IDataReader dr)
{
    T obj = default(T);
    while (dr.Read())
    {
        obj = Activator.CreateInstance<T>();
        foreach (PropertyInfo prop in obj.GetType().GetProperties())
        {
            ExcludedAttribute MyExcluded = (ExcludedAttribute)Attribute.GetCustomAttribute(prop, typeof(ExcludedAttribute));
            if (MyExcluded == null && (!object.Equals(dr[prop.Name], DBNull.Value)))
            {
                prop.SetValue(obj, dr[prop.Name], null);
            }
            else if (MyExcluded != null && (!object.Equals(dr[prop.Name], DBNull.Value))) //case property is defined as exculded and from stored procedure it's passed as blank
            {
                prop.SetValue(obj, dr[prop.Name], null);
            }
        }
    }

    return obj;
}</pre>
                </div>
                <div>
                    <pre>
public DemoModel GetDemoModelList(string DemoID)
{
    DemoModel demoModel = new DemoModel();
    using (SqlConnection con = new SqlConnection("connectionstring"))
    {
        using (SqlCommand cmd = new SqlCommand("usp_DemoGrid", con))
        {
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.Add(new SqlParameter("@DemoID", SqlDbType.Int)).Value = Convert.ToInt32(DemoID);
            if (cmd.Connection.State == ConnectionState.Closed)
            {
                con.Open();
            }
            using (IDataReader dataReader = cmd.ExecuteReader())
            {
                demoModel = ConvertTOEntity<DemoModel>(dataReader);
            }
            con.Close();
            return demoModel;
        }
    }
}
</pre>
                </div>
            </div>

            <!-- Get Data Table From List -->
            <div class="col-xs-12" id="ListToDatatable">
                <h3>GetGet Data Table From List</h3>
                <div>
                    <pre>
[System.AttributeUsage(System.AttributeTargets.Property)]
public class ExcludedAttribute : Attribute
{
}
</pre>
                </div>
                <div>
                    <pre>
public class DemoModel{
    public string DemoProperty { get; set; }
}
</pre>
                </div>
                <div>
                    <pre>
public static DataTable ListToDataTable<T>(List<T> items)
{
    DataTable dataTable = new DataTable(typeof(T).Name);

    //Get all the properties
    PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
    foreach (PropertyInfo prop in Props)
    {
        //Setting column names as Property names
        if (prop.PropertyType.FullName == "System.Byte[]")
            dataTable.Columns.Add(prop.Name, typeof(System.Byte[]));
        else
            dataTable.Columns.Add(prop.Name);
    }
    if (items != null)
    {
        foreach (T item in items)
        {
            var values = new object[Props.Length];
            for (int i = 0; i < Props.Length; i++)
            {
                //inserting property values to datatable rows
                values[i] = Props[i].GetValue(item, null);
            }
            dataTable.Rows.Add(values);
        }
    }
    //put a breakpoint here and check datatable
    return dataTable;
}</pre>
                </div>
                <div>
                    <pre>
List<DataModel> dataList = new List<DataModel>();
DataTable dt = new DataTable();
dt = ListToDataTable(dataList);
</pre>
                </div>
            </div>

            <!-- Converting list to data-table -->
            <div class="col-xs-12" id="IListToDatatable">
                <h3>Converting list to data-table</h3>
                <div>
                    <pre>
[System.AttributeUsage(System.AttributeTargets.Property)]
public class ExcludedAttribute : Attribute
{
}
</pre>
                </div>
                <div>
                    <pre>
public class DemoModel{
    public string DemoProperty { get; set; }
}
</pre>
                </div>
                <div>
                    <pre>
public static DataTable ConvertToDataTable<T>(IList<T> data)
{
    PropertyDescriptorCollection properties = TypeDescriptor.GetProperties(typeof(T));
    DataTable table = new DataTable();
    foreach (PropertyDescriptor prop in properties)
        table.Columns.Add(prop.Name, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType);
    foreach (T item in data)
    {
        DataRow row = table.NewRow();
        foreach (PropertyDescriptor prop in properties)
            row[prop.Name] = prop.GetValue(item) ?? DBNull.Value;
        table.Rows.Add(row);
    }
    return table;
}</pre>
                </div>
                <div>
                    <pre>
IList<DataModel> dataList = new IList<DataModel>();
DataTable dt = new DataTable();
dt = ConvertToDataTable(dataList);
</pre>
                </div>
            </div>

        </div>
    </div>
</body>
</html>
