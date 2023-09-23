set -e

IFS=$'\n'
DOCKERFILE=foo.Dockerfile
DOCKERFILE2=foo2.Dockerfile

BASE_IMAGE=node-utils

truncate -s 0 $DOCKERFILE $DOCKERFILE2

for CONTAINER in $(docker images -f label=express.route -f dangling=false \
    --format '{{ index .Labels "express.route"}} {{.Id}} {{.Repository}}@{{.Digest}}' |
    sort -u -k1,1); do
    IFS=' '
    echo $CONTAINER
    VAR=($CONTAINER)
    ID=${VAR[1]}
    ROUTE_IMAGE=${VAR[2]}
    ROUTE=$(docker image inspect --format '{{ index .Labels "express.route" }}' $ID)
    echo $ROUTE $ROUTE_IMAGE

    echo "FROM $ROUTE_IMAGE as $ROUTE_IMAGE" >>$DOCKERFILE
    echo "COPY --from=$ROUTE_IMAGE /mnt /mnt$ROUTE" >>$DOCKERFILE2
done

echo FROM $BASE_IMAGE >>$DOCKERFILE
echo 'CMD ["node", "ServerProd.js"]' >>$DOCKERFILE
cat $DOCKERFILE2 >>$DOCKERFILE
cat $DOCKERFILE

docker build -f $DOCKERFILE -t express-stable
