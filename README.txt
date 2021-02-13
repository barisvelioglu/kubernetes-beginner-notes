-- Publish DockerHub Public Repository

1- cd basic-http-server

2- docker build -t barisv/docker_web_app_velioglu:arm64_v7 .

3- docker push barisv/docker_web_app_velioglu:arm64_v7


-- Create Secret To Provide HTTPS To Ingress

1- openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout tls.key -out tls.crt -subj "/CN=hellodashboard.com" -days 365

2- kubectl create secret tls hellodashboard.com-tls --cert=tls.crt --key=tls.key --namespace=kube-system 

3- kubectl get secret hellodashboard.com-tls -n kube-system -o yaml

