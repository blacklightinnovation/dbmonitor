# MySQL Replication & Slow Query Monitor Web Utility
 
 Provides the ability to have up to the (interval of your choice)
 view of your mysql servers. You have the ability to 
 kill queries directly from the interface. You also get up to date
 replication statistics, including lag time and Slave IO Status.

# Installation Instructions

1.) Download and unzip the source or git clone: https://github.com/blacklightinnovation/dbmonitor

<pre>wget https://github.com/blacklightinnovation/dbmonitor/archive/master.zip

tar -xzvf master.zip /var/www/where/ever/you/to/extract/this/dba
</pre>
or
<pre>
git clone git@github.com:blacklightinnovation/dbmonitor.git /path/where/you/to/extract/this/dba
</pre>
2.) Copy the Alias Directive for apache into your conf.d folder of your Apache Installation. Update the file to match your environment, directories, etc.

3.) Create the htpasswd file with the following command:
<pre>
htpasswd -c /path/to/your/dba/folder/.htpasswd newusername
</pre>
Note: To add additional users use:
<pre>
htpasswd /path/to/your/dba/folder/.htpasswd newusername
</pre>
4.) Edit dbmclass/common.class.php to set your common db username/password

Note: The username and password set in the config should be also set on
each of your databases hosts. You must be sure that you have specific
grants for this user to access your database servers from the IP of
this host or what ever host you are installing this utility on.

Example Grant:

            GRANT SUPER
            ON *.*
            TO 'username'@'db-monitor-servers-ip'
            IDENTIFIED BY PASSWORD 'password';

5.) make sure to flush privileges.

6.) Restart apache web server and browse to http://www.yourdomain.com/dba and login with the user you created in step 3.
