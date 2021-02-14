-- Change /etc/hosts File (on HOST COMPUTER)

1- $ sudo nano /etc/hosts

2- add these lines:
    {MasterNodeIPAddress} helloworld.com
    {MasterNodeIPAddress} hellodashboard.com
    {MasterNodeIPAddress} helloregistry.com

3- Pushing to this insecure registry may fail in some versions of Docker unless the daemon is explicitly configured to trust this registry. To address this we need to edit /etc/docker/daemon.json and add:
    {
      "debug": true,
      "insecure-registries": [
        "127.0.0.1:5000",
        "helloregistry.com"
      ],
      "experimental": false
    }

4- sudo systemctl restart docker

-- Publish DockerHub Public Repository (on HOST COMPUTER)

1- $ cd basic-http-server

2- $ docker build -t barisv/docker_web_app_velioglu:arm64_v7 .

3- $ docker push barisv/docker_web_app_velioglu:arm64_v7



-- Create Secret To Provide HTTPS To Ingress (on MASTER NODE)

1- $ openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout tls.key -out tls.crt -subj "/CN=hellodashboard.com" -days 365

2- $ kubectl create secret tls hellodashboard.com-tls --cert=tls.crt --key=tls.key --namespace=kube-system 

3- $ kubectl get secret hellodashboard.com-tls -n kube-system -o yaml



-- Publish Kubernetes Docker Private Repository (on HOST COMPUTER)

1- docker build . -t helloregistry.com/docker_web_app_velioglu:arm64_v7

2- GET DOCKER IMAGES AND TAKE IMAGEID
   $ docker images | grep docker_web_app_velioglu

3- $ docker tag {IMAGEID} helloregistry.com/docker_web_app_velioglu

4- $ docker push helloregistry.com/docker_web_app_velioglu

