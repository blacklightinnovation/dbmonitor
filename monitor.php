<?php 
/**
 * MySQL Replication | Slow Query Monitor Class
 * 
 * Provides the ability to have up to the (interval of your choice)
 * view of your mysql servers. You have the ability to 
 * kill queries directly from the interface. You also get up to date
 * replication statistics, including lag time and Slave IO Status.
 * 
 * @author jearly@blacklightinnovation.vom
 * 
 */
require_once('class/common.class.php');
require_once('class/db.class.php');
/**
 * 
 * @author jearly@blacklightinnovation.com
 * 
 * Primary Monitor class. This class provides functionality 
 * to call the backend libraries to interact with your  
 *
 */
class Monitor extends Common {

    /**
     * Construct the data for the view
     * @return appliaction/json 
     */
    public function __construct()
    {
        $slaveStatus = array();
        $resp = new HttpResponse();
        
        if(isset($_GET['kill']) && $_GET['kill'] == 1)
        {
            $srv = $_GET['srv'];
            $pid = $_GET['pid'];
            
            $config = $this->config;
            
            $config['host'] = $srv;
            
            $db = new DB($config);
            if(($pid != null) && ($srv != null)){
                $query = "KILL " . (int)$pid;
                $db->query($query);
                $result['slowQueries'] = $this->getProcessList();
                $result['slaveStatus'] = $this->getSlaveStatus();
                $resp->status(200);
                $resp->setContentType('application/json');
                $resp->setData(json_encode($result));
                return $resp->send();
            }
            else {
                return false;
            }
        }
        else {
            foreach($this->getSlaveStatus() as $idx=>$value){
                $slaveStatus[] = array('host' => $idx, 'data' => $value);
            }
            $result['slowQueries'] = $this->getProcessList();
            $result['slaveStatus'] = $slaveStatus;
            $resp->status(200);
            $resp->setContentType('application/json');
            $resp->setData(json_encode($result));
            return $resp->send();
        }
    }
    /**
     * Get List of running queries on each host
     * @return application/json
     */
    private function getProcessList(){
        $slowQueryRows = array();
        $status_array = array();
        list($server_array) = $this->serversDefinitions('host');
        $config = $this->config;
        foreach($server_array as $alias => $server)
        {
            list($domain, $port) = explode(':', $server);
            $ip = gethostbyname($domain);
            $status_array[$alias]['server'] = $domain;
            $status_array[$alias]['IP'] = $ip;
            
            $config['host'] = $server;
            
            $db = new DB($config);
            $slowQueryRows[] = array('dbhost' => $alias, 'queries' => $db->getRowList('SHOW FULL PROCESSLIST'));
        }
        return $slowQueryRows;
    }
    /**
     * Get Mysql replication status for each host. 
     * @return application/json
     */
    private function getSlaveStatus(){
        $slaveStatus = array();
        $thread_status = array('Running' => 'Yes','Stopped' => 'No');
        $rows = array();
        $status_array = array();
        $config = $this->config;
        
        list($server_array) = $this->serversDefinitions('host');
        
        foreach($server_array as $alias => $server)
        {
            list($domain, $port) = explode(':', $server);
            $ip = gethostbyname($domain);
            $status_array[$alias]['server'] = $domain;
            $status_array[$alias]['IP'] = $ip;
        
            $config['host'] = $server;
        
            $db = new DB($config);
            $rows[] = $db->getRow('SHOW SLAVE STATUS');
        }
        foreach ($rows as $index=>$status)
        {
            $status_array[$alias]['Master_Host'] = $status['Master_Host'];
            $status_array[$alias]['Relay_Master_Log_File'] = $status['Relay_Master_Log_File'];
        
            foreach($thread_status as $thread => $value)
            {
                if($status['Slave_IO_Running'] == $value)
                {
                    $status_array[$alias]['Slave_IO_Running'] = $thread;
                }
        
                if($status['Slave_SQL_Running'] == $value)
                {
                    $status_array[$alias]['Slave_SQL_Running'] = $thread;
                }
            }
        
            $status_array[$alias]['Last_Error'] = $status['Last_Error'];
            $status_array[$alias]['Seconds_Behind_Master'] = $this->timeConvert($status['Seconds_Behind_Master']);
        }
        return $status_array;
    }
}

// Lets fire it off shall we?
new Monitor();
?>