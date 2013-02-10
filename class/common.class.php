<?php 
/**
 * MySQL Replication | Slow Query Monitor Common Class
 * @author jearly@blacklightinnovation.com
 * 
 * Provides common functionality such as time 
 * conversion and host/alias definitions. 
 *
 */
class Common {
    /**
     * MySQL User Information
     * 
     * Enter the common uname/pswd to access the local 
     * and remote MySQL hosts.
     * 
     * @param $config Array Username/Password
     * 
     */
    
    public $config = array(
                    'user' => 'dbuser',
                    'password' => 'dbpasswd'
    );
    
    /** 
     * DB hostnames and IP's here:
     * be sure to add a host enrty and alias entry for each
     * host you would like to monitor. 
     *  
     *  
     * @var $alias: Your hostnames resolvable via dns or local hosts file.
     * @var $hosts: IP addresses for the corresponding $alias value. 
     * Note: The IP addresses entered in $hosts must be accessible by 
     *       this host and the corresponding mysql user you have added above.
     */
    protected $alias = array(
                        'localhost'
    );
    
    protected $hosts = array(
                        '127.0.0.1'
    );
    /**
     * ######################################################################
     * Do not edit below this line!
     * ######################################################################
     */
    
    
    /**
     * Convert time into more conventional timestamp.
     * 
     * @param  Integer $sec
     * @param  Interger $pad_hours
     * @return String $time
     */
    public function timeConvert($sec, $pad_hours = false)
    {
        $time    = '';
        $hours   = intval(intval($sec) / 3600);
        $time   .= ($pad_hours) ? str_pad($hours, 2, '0', STR_PAD_LEFT). ':' : $hours. ':';
        $minutes = intval(($sec / 60) % 60);
        $time   .= str_pad($minutes, 2, '0', STR_PAD_LEFT). ':';
        $seconds = intval($sec % 60);
        $time   .= str_pad($seconds, 2, '0', STR_PAD_LEFT);
        return $time;
    }
    /**
     * Build server definitions and return server list.
     * 
     * @param String $key
     */
    public function serversDefinitions($key)
    {
        $alias_key = $this->alias;
        $host_key = $this->hosts;
        
        $db_servers = array();
    
        switch($key)
        {
            case 'alias_list':
                return array($alias_key);
                break;
            case 'alias':
                for($i = 0; $i < count($alias_key); $i++)
                    $db_servers[$alias_key[$i]] = $ip_key[$i];
                    return array($db_servers);
                break;
            case 'host_list':
                    return array($host_key);
                break;
            case 'host':
                for($i = 0; $i < count($host_key); $i++)
                    $db_servers[$alias_key[$i]] = $host_key[$i];
                    return array($db_servers);
                break;
        }
    }
}