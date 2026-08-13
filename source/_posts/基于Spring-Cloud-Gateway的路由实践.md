---
title: 基于Spring Cloud Gateway的路由实践
date: 2020-03-13 16:32:10
tags:
	- 应用技术
	- 微服务
categories: 技术总结
---

在IT和OT融合的道路上，数据能力是很重要的一环。在设备端我们通过软PLC的解决方案覆盖了常见的数采方式和工业协议，那么采来的海量数据如何存储就成了我们当前的重中之重。

在调研了流行的数据存储方案后，我们决定基于开源时序数据库打造一款工业适用、业务定制的数据存储引擎。而接下来要介绍的路由网关可以认为是整个数据存储引擎的代理人，通过路由网关的引入，极大的透明了数据存储引擎的使用。不管是工业应用还是数采网关抑或是数据分析人员都可以方便的对数据进行读写操作，没有一点负担，没有一点门槛。

<!-- more -->

## 基本介绍

Spring Cloud Gateway（下文以SCG代替）， 顾名思义这是由Spring 官方出品的一款网关产品，是Spring Cloud的子项目。再看一下官方介绍：

> This project provides a library for building an API Gateway on top of Spring MVC. Spring Cloud Gateway aims to provide a simple, yet effective way to route to APIs and provide cross cutting concerns to them such as: security, monitoring/metrics, and resiliency.

主要突出了路由功能的简单有效，同时可以在安全、监控以及扩展性方面提供不错的支持，毕竟靠着Spring Cloud这面大树。

## 架构考虑

<image src="archi.png"/>

这是官方网站的工作原理示意图，从上图可以看出SCG在整个流程中主要担任反向代理的角色。客户端请求抵达SCG后，SCG通过Handler Mapping将请求路由到Web Handler，Web Handler再通过Filter对原始请求进行处理，最终发送到被代理的服务端。

在研究SCG之前，我们发现Spring Cloud下面已经有一个成熟的API套件Spring Cloud Netflix，提供了服务注册发现（Eureka），熔断器（Hystrix），智能路由（Zuul）和客户端负载均衡（Ribbon）等特性，其中就有我们需要的路由功能Zuul。

那为什么在集成一个路由功能后，Spring Cloud还要自己开发一个用于路由的Gateway项目呢？我们来看看他们的一些对比，由于Spring Cloud只集成了Zuul1.0，所以比较也集中在Zuul1.0和SCG之间。

|         | 连接方式    | 支持服务器       | 功能                                                         |
| ------- | ----------- | ---------------- | ------------------------------------------------------------ |
| Zuul1.0 | Servlet API | Tomcat，undertow | 基本路由规则，仅支持Path的路由                               |
| SCG     | Reactor     | Netty            | 较多路由规则，可以支持header，cookie，query，method等丰富的predict定义 |

从上面的对比来看，SCG基于Project Reactor可以获得更优秀的吞吐，在功能方面相当于Zuul的优化，更加灵活的配置可以满足几乎所有的网关路由需求。

虽然说Zuul2.0也是基于Netty开发，并增强了路由和过滤器功能，然而他的多次跳票最终让Spring下决心自己做一款网关路由产品，并表示不会将Zuul2.0集成进以后的Spring Cloud中，也算一段趣闻吧。

## 网关实践

下面我们实际动手实现一个网关，结合过程中遇到的问题来熟悉SCG的各项特性。

### 初始化

我们新建一个基于Spring Boot的Maven项目，添加SCG的依赖，主要是下面两个：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

我们这里选择的是最新的Spring Boot Release版本（2.1.4）以及支持2.1的Spring Cloud分支Greenwich。 

最后建一个SpringBootApplication，参照首页的Demo去掉Hystrix和RateLimit相关的内容就可以跑起来了（https://spring.io/projects/spring-cloud-gateway）。

### 动态路由

光有个Demo肯定不行，我们的网关是要实际投产使用的，在分析了实际需求之后我们识别出急需的第一个功能是动态路由。

在文档中提供了两种方式的路由配置方式：

1. 通过java API

   直接通过RouteLocatorBuilder构建如下：

   ```java
   builder.routes().route("path_route", r -> r.path("/get").uri("http://httpbin.org")).build();
   ```

2. 通过配置文件

   通过YAML文件构建路由如下：

   ```yaml
   spring:
     cloud:
       gateway:
         routes:
         - id: host_route
           uri: https://example.org
           predicates:
         - path=/foo/{segment},/bar/{segment}
   
   ```

但是我们实际需求中存在动态分配路由的场景，以上两种方式显然都不能满足需求。

通过查看源代码发现SCG加载路由是通过RouteDefinitionLocator接口实现，有以下默认实现（框掉的部分可以暂时忽略，这是我们自己的实现）：

<image src="code1.png"/>

在GatewayAutoConfiguration中通过Primary的方式指定CompositeRouteDefinitionLocator作为路由定义加载的入口，通过组合模式将所有的RouteDefinitionLocator代理。最终通过CompositeRouteDefinitionLocator的getRouteDefinitions方法将所有定义加载出来。

<image src="code2.png"/>

<image src="code3.png"/>

通过源代码的解读，我们发现如果需要定义新的路由加载方式，只需要增加一个RouteDefinitionLocator的实现即可，在实际操作中为了方便路由更新我们仿照已有的实现

InMemoryRouteDefinitionRepository进行实现，类图如下：

<image src="class_diagram.png"/>

我们通过新增了一个抽象类类完成RouteDefinitionRepository的扩展，在抽象类里我们实现了基本的get, save, delete方法，另外新增了refresh方法用于刷新缓存，而缓存的实现参考了InMemory的实现方式。

在需要进行扩展的时候我们可以通过继承AbstractRoutConfigure来增加我们自己的configure loader，再通过Configuration方式注入即可：

<image src="code4.png"/>

最终的实现效果是我们通过数据库变更配置后，通过restful接口来调用refresh方法即可完成路由的动态刷新。

### 服务路由

通过上面动态路由的基本实现，我们数据库中的配置是这样的：

<image src="table.png"/>

但是我们是要做微服务和集群的网关，直接写地址显然是不行的。

针对这种情况，SCG提供了一种URI的格式：lb://main-service，其中main-service是我们微服务在注册中心的name。当URI以lb开头，则在进行URI解析的时候会去寻找zookeeper，consul，eureka对应的客户端实现。我们使用的是eureka，并且在数据库中加上以下配置：

<image src="table2.png"/>

这样我们就可以成功代理微服务提供的接口了。

### 容错管理

容错管理从以下两方面进行考虑：

1. 路由未定义

   针对路由未找到的情况，提供有意义的报错信息进行有效反馈。

   实现层面主要通过定义一个NotFound的路由，通过设置order确保NotFound路由在所有的路由之后执行，这样当所有的路由都没有匹配上的时候就会被路由到NotFound路由，从而反馈有意义的报错信息。

2. 熔断器

   熔断器主要应用于请求超时，服务端错误等使用场景，SCG提供了Hystrix的集成，我们只需要在YAML配置文件里面配置default filter并加入fallbackUri的实现即可。

   ```yaml
   spring: 
     cloud:
       gateway:
         default-filters:
         - name: Hystrix
           args:
             name: fallbackcmd
             fallbackUri: forward:/fallbackcontroller
   
   ```

通过上面两点的配置，我们在请求出错如超时、服务宕机的情况都可以得到对应的错误信息，确保了网关服务的鲁棒性。

### 限流机制

SCG使用的限流机制（Rate Limiter）基于令牌桶算法，我们先大致了解一下令牌桶算法。

<image src="rate.png"/>

从上图可以看出，令牌桶算法的主要数据结构是个缓冲区。通过匀速生成的令牌来填充缓冲区相当于生产者，而实际流量则相当于消费者来消费缓冲区中的令牌。 

我们再结合SCG中的实现来看看令牌桶算法如何限流的。

SCG使用RateLimiter需要引入spring-boot-starter-data-redis-reactive，所以SCG的令牌桶实现是基于Redis的，这样可以满足分布式的要求。SCG在使用过程中需要设置三个参数replenishRate ，burstCapacity和KeyResolver。

- replenishRate表示的是装桶的速率，也就是令牌生成的速率
- burstCapacity表示瞬间高爆发的容量，官方文档解释是一秒内允许的最大流量又补充了一句是令牌桶可以装下的令牌数
- KeyResolver很好理解，通过key的定义可以明确规定限流的层级，用户级还是IP级别等等

对于burstCapacity的理解，只有当replenishRate和burstCapacity相等时也就是请求处理基本是匀速的情况下，burstCapacity才表示一秒内允许的最大流量，否则解释为令牌桶的容量更加贴切。

代码实现主要通过RedisRateLimiter.class和request_rate_limiter.lua两个文件，而主要逻辑是通过脚本文件实现。

<image src="code5.png"/>

这里主要获取java传过来的参数，计算出ttl，ttl的逻辑是桶装满所需时间的两倍。

<image src="code6.png"/>

上面这段代码是实现限流的关键，每次都会通过当前时间和上次刷新时间的间隔计算填充的令牌，只有填充后的令牌 >= 请求的令牌数才符合条件允许令牌获取。

当新的请求获取令牌后，更新令牌桶的令牌数和最后刷新时间。

在实际引用中我们根据我们服务器的压力来设定rate和capacity，通过不停的调节来寻求吞吐和负载的平衡。

### 日志配置

日志配置方面除了基本的logback配置，需要加入access_log的配置，根据官方文档我们需要在logback配置文件中加入logger和appender的配置。

<image src="code7.png"/>

如上图所示，通过定义logger接收netty的AccessLog，通过异步发射器发送到accessLog和errorLog两个Appender，在Appender中通过filter来区分日志类型。 

这里需要注意的是Netty AccessLog的配置要到reactor-netty0.7.9之后才支持，所以在使用这个功能之前需要确保我们netty的版本满足要求，项目目前使用的spring版本如下，对应的reactor-netty版本为0.8.6。

配置了这么多，然而access.log文件还是空空如也，因为你漏掉了很重要的一步：

在启动参数中添加 `-Dreactor.netty.http.server.accessLogEnabled=true`. 注意这个属性是java系统属性而不是spring配置属性，也就是说只能通过启动参数注入。

## 总结

我们通过一些简单的介绍了解了SCG的出现背景，然后通过实际的网关搭建实践来一步步的理解SCG的架构理念和实现细节。

通过动态路由部分我们见证了SCG的可扩展性架构，在服务路由和容错管理部分我们主要和Spring Cloud已有组件（eureka， hystrix）进行集成，而在限流机制部分我们通过阅读源代码理解了基于令牌桶的限流算法以及如何结合Redis实现分布式系统限流，在日志配置部分主要是结合Netty的日志机制来完成网关的访问日志配置。

在我们的实践中我们没有用上SCG的所有特性，但是就目前的情况用于我们自己的API 网关已经够用。

