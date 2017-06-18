# nark
FROM node:7

# working dir
USER root
RUN mkdir -p /usr/src/app/log
WORKDIR /usr/src/app

# get latest updates
RUN apt-get update ; apt-get -yq dist-upgrade ;\
apt-get -yq autoremove ; apt-get clean ;\
rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# install
COPY package.json /usr/src/app/
RUN npm install --quiet
COPY . /usr/src/app

# run
EXPOSE 4900
CMD [ "npm", "start" ]
