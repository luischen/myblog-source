---
title: "PDM业务领域知识"
date: 2026-06-23 17:07:58
updated: 2026-08-13 15:49:17
categories:
  - 工作笔记
tags:
  - "工作笔记"
  - "Domain Knowledge"
source_path: "20_Domain_Knowledge/24 预测性维护/00 PDM业务领域知识笔记.md"
---
说明：本文结合当前后端实现整理。若文档描述与系统实现存在差异，以系统实现为准。本文刻意区分“领域知识”和“系统知识”：前者回答预测性维护是什么，后者回答本系统如何承载预测性维护。

## 1. 领域知识：预测性维护在解决什么问题

预测性维护的核心不是把设备故障记录下来，而是在设备状态劣化早期识别风险，让维护从“故障后处理”转向“风险前干预”。

传统维护通常有三种模式：

<table>
  <thead>
    <tr>
      <th>维护模式</th>
      <th>业务特点</th>
      <th>主要问题</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>事后维修</td>
      <td>坏了再修，短期投入低</td>
      <td>停线损失不可控，故障影响容易扩大</td>
    </tr>
    <tr>
      <td>定期保养</td>
      <td>按周期检修，管理简单</td>
      <td>可能过度维护，也可能错过突发劣化</td>
    </tr>
    <tr>
      <td>预测性维护</td>
      <td>根据设备状态和趋势安排维护</td>
      <td>依赖数据质量、模型可信度和业务闭环</td>
    </tr>
  </tbody>
</table>

预测性维护的业务价值可以概括为四件事：

1. 提前发现风险：在故障形成前识别异常趋势。
2. 降低停线损失：把不可控停机变成可计划维护。
3. 减少无效保养：让维护动作基于状态，而不是只基于时间。
4. 沉淀设备知识：把经验、规则、模型和历史事件持续积累。

## 2. 领域知识：从数据到维护动作的价值链

预测性维护不是单点能力，而是一条从设备数据到维护决策的价值链。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>设备运行</b><br/>产生时序信号</td>
    <td style="padding:10px; text-align:center;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>特征提取</b><br/>形成可观察指标</td>
    <td style="padding:10px; text-align:center;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>模型诊断</b><br/>判断健康状态</td>
    <td style="padding:10px; text-align:center;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>事件识别</b><br/>生成风险信号</td>
    <td style="padding:10px; text-align:center;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>维护决策</b><br/>检修、观察、复核</td>
  </tr>
</table>

这条价值链里有几个关键概念：

<table>
  <thead>
    <tr>
      <th>概念</th>
      <th>业务含义</th>
      <th>判断重点</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>设备</td>
      <td>被监测和维护的资产对象</td>
      <td>设备是否被纳入监测范围，所属区域和产线是否清晰</td>
    </tr>
    <tr>
      <td>工况</td>
      <td>设备运行所处的业务场景或条件</td>
      <td>同一设备在不同工况下的正常范围可能不同</td>
    </tr>
    <tr>
      <td>特征</td>
      <td>由原始信号加工出的状态观察量</td>
      <td>特征是否稳定、可解释、能反映劣化趋势</td>
    </tr>
    <tr>
      <td>模型</td>
      <td>把特征映射为诊断结论的判断逻辑</td>
      <td>模型是否适配设备、部件、工况和维护目标</td>
    </tr>
    <tr>
      <td>事件</td>
      <td>值得业务关注的异常或风险记录</td>
      <td>事件是否能驱动明确的维护动作</td>
    </tr>
  </tbody>
</table>

## 3. 领域知识：业务架构

从业务视角看，预测性维护可以拆成“资产域、数据域、诊断域、维护域、治理域”五层。

<table style="width:100%; border-collapse:collapse;">
  <thead>
    <tr>
      <th style="border:1px solid #ddd; padding:8px;">业务层</th>
      <th style="border:1px solid #ddd; padding:8px;">关注对象</th>
      <th style="border:1px solid #ddd; padding:8px;">核心问题</th>
      <th style="border:1px solid #ddd; padding:8px;">典型产出</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #ddd; padding:8px;">资产域</td>
      <td style="border:1px solid #ddd; padding:8px;">区域、产线、工位、设备、部件</td>
      <td style="border:1px solid #ddd; padding:8px;">监测谁，谁负责，影响哪里</td>
      <td style="border:1px solid #ddd; padding:8px;">设备清单、监测范围、授权范围</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:8px;">数据域</td>
      <td style="border:1px solid #ddd; padding:8px;">采集信号、工况、特征、时间窗口</td>
      <td style="border:1px solid #ddd; padding:8px;">数据是否可信、连续、可比较</td>
      <td style="border:1px solid #ddd; padding:8px;">特征曲线、聚合结果、导出数据</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:8px;">诊断域</td>
      <td style="border:1px solid #ddd; padding:8px;">模型、阈值、诊断结果、趋势</td>
      <td style="border:1px solid #ddd; padding:8px;">风险是否真实，是否持续劣化</td>
      <td style="border:1px solid #ddd; padding:8px;">健康状态、风险趋势、诊断详情</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:8px;">维护域</td>
      <td style="border:1px solid #ddd; padding:8px;">事件、告警、处置、复核</td>
      <td style="border:1px solid #ddd; padding:8px;">谁处理，何时处理，处理后是否有效</td>
      <td style="border:1px solid #ddd; padding:8px;">事件记录、维护建议、闭环结论</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:8px;">治理域</td>
      <td style="border:1px solid #ddd; padding:8px;">配置、训练、同步、历史追溯</td>
      <td style="border:1px solid #ddd; padding:8px;">判断规则是否可控，变更是否可追溯</td>
      <td style="border:1px solid #ddd; padding:8px;">配置包、训练记录、操作历史</td>
    </tr>
  </tbody>
</table>

## 4. 系统知识：本 PDM 系统的定位

本系统更像是预测性维护的“云端业务中枢”。它负责统一管理设备监测配置、分析模型、诊断展示、事件查询和配置同步；实时计算和规则判断则更多放在边缘侧完成。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:12px; vertical-align:top;">
      <b>云端业务中枢</b><br/>
      配置管理、模型训练、结果查看、事件管理、历史追溯
    </td>
    <td style="padding:12px; text-align:center; vertical-align:middle;">配置下发 ↓<br/>结果上报 ↑</td>
    <td style="border:1px solid #ddd; padding:12px; vertical-align:top;">
      <b>边缘计算节点</b><br/>
      设备对接、特征计算、模型计算、规则判断、事件生成
    </td>
    <td style="padding:12px; text-align:center; vertical-align:middle;">←</td>
    <td style="border:1px solid #ddd; padding:12px; vertical-align:top;">
      <b>现场设备</b><br/>
      运行数据、工况数据、状态变化
    </td>
  </tr>
</table>

系统里可以看到五类核心能力：

<table>
  <thead>
    <tr>
      <th>能力</th>
      <th>系统职责</th>
      <th>业务结果</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>模型管理</td>
      <td>管理分析模型、配置、训练和历史</td>
      <td>让诊断标准可配置、可训练、可追溯</td>
    </tr>
    <tr>
      <td>特征数据</td>
      <td>查询、展示和导出设备特征数据</td>
      <td>支撑模型解释和问题复盘</td>
    </tr>
    <tr>
      <td>设备诊断</td>
      <td>按设备层级查看模型关系、状态和趋势</td>
      <td>让运维人员定位风险设备和风险部位</td>
    </tr>
    <tr>
      <td>事件管理</td>
      <td>查询事件、管理事件规则和指标</td>
      <td>把模型异常转成可跟踪的业务事件</td>
    </tr>
    <tr>
      <td>配置同步</td>
      <td>按授权设备和站点范围生成下发配置</td>
      <td>保证边缘节点只执行当前有效的业务配置</td>
    </tr>
  </tbody>
</table>

## 5. 系统知识：模块视角

系统模块可以按业务责任重新理解，而不是只按工程目录理解。

<table>
  <thead>
    <tr>
      <th>业务模块</th>
      <th>面向的业务问题</th>
      <th>主要能力</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>模型中心</td>
      <td>诊断逻辑如何管理、训练和下发</td>
      <td>模型列表、配置修改、模型导入导出、训练、手动计算</td>
    </tr>
    <tr>
      <td>数据挖掘</td>
      <td>特征数据如何查看、对比和复盘</td>
      <td>特征项查询、曲线表格展示、数据导出、统计分析</td>
    </tr>
    <tr>
      <td>设备中心</td>
      <td>运维人员如何从设备角度看风险</td>
      <td>设备层级筛选、诊断详情、趋势聚合、事件规则</td>
    </tr>
    <tr>
      <td>数据中心</td>
      <td>系统数据如何统一存取和同步</td>
      <td>基础数据查询、诊断结果存储、配置包生成、事件数据管理</td>
    </tr>
    <tr>
      <td>基础能力</td>
      <td>系统如何运行得稳定可控</td>
      <td>定时任务、消息队列、启动状态、通用工具、权限过滤</td>
    </tr>
  </tbody>
</table>

## 6. 系统知识：关键业务流程

### 6.1 配置同步流程

配置同步的业务含义是：云端把“当前允许计算、且边缘节点需要执行”的配置整理出来，下发给边缘。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>边缘节点请求配置</b><br/>携带站点范围</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>云端校验授权</b><br/>确认可计算设备数量</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>筛选有效配置</b><br/>特征、模型、事件</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>补齐触发关系</b><br/>形成计算网络</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>返回配置包</b><br/>边缘执行</td>
  </tr>
</table>

系统实现里，配置包不是一个单纯的模型清单，而是包含特征计算、分析模型、训练结果、模型配置、事件规则和触发关系的组合。这里的关键业务原则是“按站点范围和授权范围下发”。

### 6.2 模型训练流程

模型训练负责把历史数据转化为后续诊断可用的判断标准。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>用户选择模型</b><br/>指定训练范围</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>记录训练历史</b><br/>保留操作追溯</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>异步训练</b><br/>避免阻塞页面操作</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>更新训练结果</b><br/>生成阈值或模型参数</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>参与后续诊断</b><br/>影响展示和规则判断</td>
  </tr>
</table>

系统还支持基于历史事件进行自动训练。业务上可以理解为：当事件样本被积累和标注后，系统可以用这些样本反向修正模型阈值，使模型更贴近现场真实状态。

### 6.3 手动计算流程

手动计算适合补算历史区间，尤其是在模型配置调整、数据补传或现场复盘后重新生成诊断结果。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>云端发起</b><br/>选择诊断对象和起点</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>检查计算占用</b><br/>避免并发冲突</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>匹配在线节点</b><br/>按设备所在站点路由</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>清理旧结果</b><br/>从起点重新计算</td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>边缘执行并回调</b><br/>云端更新历史</td>
  </tr>
</table>

这个流程的业务重点不是“能不能重新算”，而是“重新算时不能破坏正在进行的数据同步、定时计算和训练可信度”。因此系统中有计算占用控制和回调确认机制。

### 6.4 诊断查看流程

诊断查看以设备为入口，逐步下钻到模型关系和诊断结果。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>选择区域</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>选择产线</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>选择工位</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>选择设备</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>查看诊断对象</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>查看状态与趋势</b></td>
  </tr>
</table>

系统在设备层级筛选时，会优先展示已经配置模型关系的对象。这样用户不会在没有诊断能力的设备上空转。

### 6.5 事件闭环流程

事件是模型结果进入维护业务的入口。

<table style="width:100%; border-collapse:collapse;">
  <tr>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>诊断结果异常</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>命中事件规则</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>生成事件</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>运维复核</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>处置反馈</b></td>
    <td style="padding:10px;">→</td>
    <td style="border:1px solid #ddd; padding:10px; text-align:center;"><b>反哺模型和规则</b></td>
  </tr>
</table>

当前系统已经覆盖事件生成、事件查询、规则配置和指标管理。更完整的业务闭环，还需要把“处置反馈”和“模型效果评估”进一步产品化。

## 7. 系统知识：当前实现体现出的业务特征

结合代码逻辑，本系统有几个明确的业务特征：

1. 以设备为业务主线：概览、诊断、特征查询都围绕设备层级展开。
2. 以模型关系为诊断单元：同一设备可以有多个诊断视角，适合表达设备不同部位或不同风险类型。
3. 以边缘节点承载实时计算：云端重在配置、训练、展示和追溯，边缘重在执行。
4. 以授权范围控制计算规模：配置同步时会结合授权设备范围，避免边缘执行超出许可或业务范围的计算。
5. 以历史记录支撑追溯：配置修改、模型训练、手动计算都有历史记录，便于复盘。

## 8. 系统优化与演进思考

### 8.1 从“结果展示”走向“维护闭环”

当前系统已经能展示诊断状态、趋势和事件，但维护动作本身还可以继续增强。建议后续补齐事件处置、复核结论、误报标记、实际故障确认、维修结果回填等能力。

这样模型可以从“输出异常”演进为“持续学习现场反馈”。

### 8.2 建立模型效果评估体系

预测性维护系统的可信度，最终取决于模型在现场的表现。建议增加模型效果看板，例如：

- 告警命中率
- 误报率
- 漏报追溯
- 提前预警时间
- 不同设备和产线的模型稳定性

这些指标比单纯展示模型结果更能支撑业务决策。

### 8.3 强化设备部件层级表达

文档中已经提到，同一设备多个子部件使用同一模型时，容易造成模型拆分和维护复杂度上升。当前系统通过“诊断关系”承载差异化，这是合理方向。

后续可以进一步显式化“设备部件”或“监测点”概念，让模型、部件、输入特征和展示名称之间的关系更清晰，减少靠命名约定表达业务差异。

### 8.4 配置治理产品化

配置同步是系统稳定运行的关键，但从业务角度还可以增强：

- 配置版本管理
- 下发前差异预览
- 边缘节点配置一致性校验
- 回滚机制
- 配置生效范围可视化

这样可以降低现场调试和配置变更风险。

### 8.5 训练流程从“任务驱动”走向“生命周期管理”

当前训练有手动训练、自动训练和历史记录。后续可以把训练视为模型生命周期的一部分：

- 训练数据集管理
- 样本质量检查
- 训练前后效果对比
- 模型版本发布
- 灰度下发
- 失效模型提醒

这会让模型治理从“能训练”变成“可运营”。

### 8.6 提升云边协同可观测性

云边协同里最容易出问题的是同步延迟、节点离线、计算堆积和回调失败。建议补充云边协同看板：

- 节点在线状态
- 配置版本状态
- 计算任务队列
- 最近同步时间
- 回调成功率
- 边缘错误原因分布

这类能力能显著提升现场排障效率。

### 8.7 把业务规则与模型诊断分层治理

模型输出的是诊断信号，事件规则决定业务触达方式。建议继续保持二者分层，并增强规则治理：

- 规则模拟运行
- 静默期效果分析
- 规则触发次数趋势
- 规则冲突检查
- 指标和事件的血缘追踪

这样可以减少重复告警，也能让业务人员更放心地调整规则。

## 9. 总结

预测性维护的领域核心，是围绕设备状态建立“数据感知、模型诊断、事件识别、维护反馈”的闭环。

当前 PDM 系统已经具备云端配置治理、模型训练、诊断展示、特征查询、事件规则和云边配置同步等关键能力。下一阶段最值得投入的方向，是把诊断结果继续向维护闭环、模型效果评估、配置版本治理和云边可观测性推进，让系统从“能判断异常”演进为“能持续提升维护决策质量”。







