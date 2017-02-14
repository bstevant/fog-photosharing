BASEDIR=/vagrant/code/deploy
LOGDIR=`date +%Y-%m-%d-%H:%M`
mkdir $BASEDIR/logs/$LOGDIR
rm -f $BASEDIR/logs/current
ln -s $LOGDIR $BASEDIR/logs/current
#ansible-playbook deploy-bench.yml -i hosts/uc0
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc0
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc1
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc2
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc3
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc4
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc5
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc6
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc7
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc8
ansible-playbook $BASEDIR/deploy-bench.yml -i $BASEDIR/hosts/uc9
