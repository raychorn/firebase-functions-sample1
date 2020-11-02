# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.145.1/containers/ubuntu/.devcontainer/base.Dockerfile

# [Choice] Ubuntu version: bionic, focal
ARG VARIANT="bionic"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

LABEL version="1.3"
LABEL maintaner="Ray C Horn (raychorn@gmail.com)"
LABEL release-date="10-27-2020"
LABEL promoted="true"

RUN apt-get update -y && \
    apt-get install curl -y --fix-missing && \
    apt-get install build-essential libssl-dev -y --fix-missing

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections

RUN apt-get update && apt-get install -y -q --no-install-recommends \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    git \
    libssl-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install nodejs -y -q --fix-missing

RUN curl -sL https://firebase.tools | bash

RUN apt-get upgrade git -y --fix-missing && \
    apt install default-jre -y --fix-missing && \
    apt install openjdk-11-jre-headless -y --fix-missing && \
    apt install openjdk-8-jre-headless -y --fix-missing 

RUN apt install libz-dev libssl-dev libcurl4-gnutls-dev libexpat1-dev gettext cmake gcc -y && \
    cd /tmp && \
    curl -o git.tar.gz https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.29.2.tar.gz && \
    tar -zxf git.tar.gz && \
    cd git-* && \
    make prefix=/usr/local all && \
    make prefix=/usr/local install && \
    git config --global user.email "raychorn@gmail.com" && \
    git config --global user.name "Ray C Horn" 
