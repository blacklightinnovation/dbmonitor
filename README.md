# MySQL Replication | Slow Query Monitor Web Utility
 
 Provides the ability to have up to the (interval of your choice)
 view of your mysql servers. You have the ability to 
 kill queries directly from the interface. You also get up to date
 replication statistics, including lag time and Slave IO Status.
 
 Author jearly@blacklightinnovation.vom
 

# Installation Instructions

1.) Copy the Alias Directive for apache into your conf.d folder of your Apache
    Installation. Update the file to match your environment, directories, etc.
    
2.) Create the htpasswd file with the following command:
    
    htpasswd -c /path/to/your/dba/folder/.htpasswd newusername
    
    Note: To add additional users use:
    
    htpasswd /path/to/your/dba/folder/.htpasswd newusername
    
3.) Edit dbmclass/common.class.php to set your common db username/password
    
    Note: The username and password set in the config should be also set on 
          each of your databases hosts. You must be sure that you have specific 
          grants for this user to access your database servers from the IP of 
          this host or what ever host you are installing this utility on.
          
    Example Grant: 
                GRANT SUPER 
                ON *.* 
                TO 'username'@'db-monitor-servers-ip' 
                IDENTIFIED BY PASSWORD 'password';

4.) make sure to flush privileges.

4.) Restart apache web server and browse to http://www.yourdomain.com/dba
    and login with the user you created in step 2.
