----------------------------------------------------------------------------------------
-- Change /etc/hosts File (on HOST COMPUTER)
----------------------------------------------------------------------------------------

1- $ sudo nano /etc/hosts

2- # add these lines:
    {MasterNodeIPAddress} hello-world.com
    {MasterNodeIPAddress} hello-dashboard.com
    {MasterNodeIPAddress} hello-registry.com
    {PI3Address} hello-gitlab.com

3- # Pushing to this insecure registry may fail in some versions of Docker unless the daemon is explicitly configured to trust this registry. To address this we need to edit /etc/docker/daemon.json and add:
    {
      "debug": true,
      "insecure-registries": [
        "127.0.0.1:5000",
        "hello-registry.com"
      ],
      "experimental": false
    }

4- sudo systemctl restart docker

----------------------------------------------------------------------------------------
-- Set Static IP to Ubuntu Server
----------------------------------------------------------------------------------------

1 - # Create this file to disable default network config
    $ sudo nano /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg
    
    network: {config: disabled}

2 - $ sudo nano /etc/netplan/00-installer-config.yaml

network:
  version: 2
  ethernets:
    eth0:
      addresses: [{static-ip-you-want-to-set}}/24]
      gateway4: 192.168.1.1
      nameservers: 
        addresses: [8.8.8.8, 8.8.4.4]

3- $ sudo netplan try

4- $ sudo netplan apply

5- $ sudo reboot


----------------------------------------------------------------------------------------
---  Install MicroK8S on Ubuntu - Raspberry PI
----------------------------------------------------------------------------------------

0- sudo apt-get update

1- First of all, change hostname of Computer
   $ sudo nano /etc/hostname

2- Edit /boot/firmware/cmdline.txt and add two cgroup property
   $ sudo nano /boot/firmware/cmdline.txt
   cgroup_enable=memory cgroup_memory=1

3- $ sudo swapoff -a

4- $ sudo reboot

5- $ sudo snap install microk8s --classic --stable

6- $ sudo usermod -a -G microk8s ubuntu
   $ sudo chown -f -R ubuntu ~/.kube

7- $ sudo microk8s.start

8- Need to wait for a while....... (sometimes a few minutes)

9- $ sudo apt-get install iptables-persistent
   $ sudo iptables -P FORWARD ACCEPT
   $ sudo iptables -A FORWARD -j ACCEPT 


10- For Kubernetes Master Node enable these
    $ sudo microk8s.enable helm3 storage dns registry dashboard ha-cluster ingress

11- $ microk8s kubectl get all --all-namespaces
   
12- Get token for login to dashboard
    $ token=$(sudo microk8s kubectl -n kube-system get secret | grep default-token | cut -d " " -f1)
    $ sudo microk8s kubectl -n kube-system describe secret $token

13- # Create alias for most used commands
    $ sudo snap alias microk8s.kubectl kubectl
    $ sudo snap alias microk8s.helm3 helm

14- # Check all resources
    $ microk8s kubectl get all --all-namespaces

15- # To make this node as master node run the following
    # Then run output on worker nodes
    
    $ sudo microk8s.add-node

----------------------------------------------------------------------------------------
-- Publish DockerHub Public Repository (on HOST COMPUTER)
----------------------------------------------------------------------------------------

1- $ cd basic-http-server

2- $ docker build -t barisv/docker_web_app_velioglu:arm64_v7 .

3- $ docker push barisv/docker_web_app_velioglu:arm64_v7


----------------------------------------------------------------------------------------
-- Create Secret To Provide HTTPS To Ingress (on MASTER NODE)
----------------------------------------------------------------------------------------

1- $ openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout tls.key -out tls.crt -subj "/CN=hello-dashboard.com" -days 365

2- $ kubectl create secret tls hello-dashboard.com-tls --cert=tls.crt --key=tls.key --namespace=kube-system 

3- $ kubectl get secret hello-dashboard.com-tls -n kube-system -o yaml


----------------------------------------------------------------------------------------
-- Publish To Kubernetes Docker Private Repository (on HOST COMPUTER)
----------------------------------------------------------------------------------------

1- docker build . -t helloregistry.com/docker_web_app_velioglu:arm64_v7

2- GET DOCKER IMAGES AND TAKE IMAGEID
   $ docker images | grep docker_web_app_velioglu

3- $ docker tag {IMAGEID} helloregistry.com/docker_web_app_velioglu

4- $ docker push helloregistry.com/docker_web_app_velioglu


----------------------------------------------------------------------------------------
--- The Helm Chart File Structure
----------------------------------------------------------------------------------------

wordpress/
  Chart.yaml          # A YAML file containing information about the chart
  LICENSE             # OPTIONAL: A plain text file containing the license for the chart
  README.md           # OPTIONAL: A human-readable README file
  values.yaml         # The default configuration values for this chart
  values.schema.json  # OPTIONAL: A JSON Schema for imposing a structure on the values.yaml file
  charts/             # A directory containing any charts upon which this chart depends.
  crds/               # Custom Resource Definitions
  templates/          # A directory of templates that, when combined with values,
                      # will generate valid Kubernetes manifest files.
  templates/NOTES.txt # OPTIONAL: A plain text file containing short usage notes

----------------------------------------------------------------------------------------
---  Install Gitlab on Ubuntu (Externally) - Raspberry PI
----------------------------------------------------------------------------------------

1- $ sudo apt-get update -y

2- $ cd /tmp  

3- $ wget --content-disposition https://packages.gitlab.com/gitlab/gitlab-ce/packages/ubuntu/focal/gitlab-ce_13.8.1-ce.0_arm64.deb/download.deb

4- $ sudo apt-get install -y libatomic1

5- $ sudo dpkg -i gitlab-ce_13.8.1-ce.0_arm64.deb

6- $ sudo nano /etc/gitlab/gitlab.rb 
   # Change external_url as IP address of Raspberry PI
   external_url = {ip-address-of-device}
   # Reduce the number of running workers to the minimum in order to reduce memory usage
   puma['worker_processes'] = 2
   sidekiq['concurrency'] = 9
   # Turn off monitoring to reduce idle cpu and disk usage
   prometheus_monitoring['enable'] = false

8- $ sudo gitlab-ctl reconfigure

9- $ sudo gitlab-ctl start

