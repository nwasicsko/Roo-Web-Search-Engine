// Database Structure 
CREATE TABLE `search` (
 `title` text NOT NULL,
 `description` text NOT NULL,
 `link` text NOT NULL,
 FULLTEXT KEY ('title','description')
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1

<?php
if(isset($_POST['search']))
{
 $host="localhost";
 $username="root";
 $password="";
 $databasename="sample";
 $connect=mysql_connect($host,$username,$password);
 $db=mysql_select_db($databasename);

 $search_val=$_POST['search_term'];
	
 $get_result = mysql_query("select * from search where MATCH(title,description) AGAINST('$search_val')");
 while($row=mysql_fetch_array($get_result))
 {
  echo "<li><a href='http://talkerscode.com/webtricks/".$row['link']."'><span class='title'>".$row['title']."</span><br><span class='desc'>".$row['description']."</span></a></li>";
 }
 exit();
}
?>
