```sh
docker build -t node-utils .
bash build-express.sh
docker run -it --rm --name express --replace --pod nginx-pod -e AWS_REGION=ap-northeast-2 --replace express-stabl
```