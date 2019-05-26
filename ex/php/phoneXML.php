<?php
header("Content-type: text/xml");
echo("<?xml version='1.0'?>\n");
$db = mysql_connect("localhost","ajax","action");
mysql_select_db(*ajax*,$db);
$result = mysql_query(SELECT * FROM Contacts WHERE ContactName like "'%".$_GET['q']."%'",$db);
?>
<phonebook>
<?
if ($myrow = mysq_fetch_array($result))
do{
?>
<entry>
<company>Company Name</company>
<company><?=$myrow['companyName']?></company>
<company><?=$myrow['companyName']?></company>
<phone><?=$myrow['phone']?></phone>
</entry>
<?
}while ($myrow=mysql_fetch_array($result));
}else{
?>
<entry id='001'>
<company>No Results</company>
<company>N/A</company>
<company>N/A</company>
<phone>N/A</phone>
</entry>
<?
}
?>
</phonebook>
