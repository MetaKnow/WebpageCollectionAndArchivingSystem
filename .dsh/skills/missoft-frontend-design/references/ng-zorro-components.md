# NG-ZORRO 组件索引（v22.1.2）

> 由 `ng-zorro-antd@22.1.2` 的 secondary entry `types/*.d.ts` 自动解析生成，共 287 条公开声明。
> 导入路径 = `ng-zorro-antd/<目录>`；`inputs`/`outputs` 为类属性名（v22 全部为 `nzXxx` 命名，个别指令用 `nz*` 前缀）。

## 按任务找组件

| 任务 | 首选 | 次选 / 组合 |
| --- | --- | --- |
| 页面骨架（侧边导航 + 顶栏 + 内容区） | `nz-layout` + `nz-sider` + `nz-header` + `nz-content` | `nz-page-header`、`nz-breadcrumb` |
| 数据列表 / 分页 / 排序 / 筛选 | `nz-table` | `nz-pagination`、`nz-empty`、`nz-spin` |
| 新增 / 编辑表单 | `nz-form` + `nz-form-item` + `nz-form-control` | `nz-input`、`nz-select`、`nz-date-picker`、`nz-input-number` |
| 查询条件区 | `nz-form[nzLayout="inline"]` + `nz-space` | `nz-input-search`、`nz-select`、`nz-range-picker` |
| 详情展示 | `nz-descriptions` | `nz-card`、`nz-tabs`、`nz-timeline` |
| 弹窗确认 / 表单弹窗 | `nz-modal` | 服务式 `NzModalService` |
| 侧滑详情 / 编辑 | `nz-drawer` | — |
| 全局提示 | `NzMessageService` | `nz-alert`（页面内常驻） |
| 通知 | `NzNotificationService` | — |
| 树 / 级联 / 树选择 | `nz-tree` | `nz-cascader`、`nz-tree-select` |
| 上传（含拖拽） | `nz-upload` | `nz-progress` |
| 步骤条 / 审批流 | `nz-steps` | `nz-timeline` |
| 标签页 | `nz-tabs` + `nz-tab` | `nz-segmented`（轻量切换） |
| 状态标签 | `nz-tag` | `nz-badge` |
| 空状态 / 结果页 / 异常 | `nz-empty` | `nz-result` |
| 统计数值 | `nz-statistic` | `nz-progress` |
| 描述列表 | `nz-descriptions` + `nz-descriptions-item` | — |
| 抽屉表单按钮区 | `nz-space` + `nz-button` | — |
| 图标 | `nz-icon` | `provideNzIcons` 静态注册 |

## 导入路径与模块

| 导入路径 | 模块 | 声明数 |
| --- | --- | ---: |
| `ng-zorro-antd/affix` | `NzAffixModule` | 1 |
| `ng-zorro-antd/alert` | `NzAlertModule` | 2 |
| `ng-zorro-antd/anchor` | `NzAnchorModule` | 2 |
| `ng-zorro-antd/auto-complete` | `NzAutocompleteModule` | 5 |
| `ng-zorro-antd/avatar` | `NzAvatarModule` | 2 |
| `ng-zorro-antd/badge` | `NzBadgeModule` | 2 |
| `ng-zorro-antd/breadcrumb` | `NzBreadCrumbModule` | 3 |
| `ng-zorro-antd/button` | `NzButtonModule` | 1 |
| `ng-zorro-antd/calendar` | `NzCalendarModule` | 6 |
| `ng-zorro-antd/card` | `NzCardModule` | 4 |
| `ng-zorro-antd/carousel` | `NzCarouselModule` | 2 |
| `ng-zorro-antd/cascader` | `NzCascaderModule` | 2 |
| `ng-zorro-antd/check-list` | `NzCheckListModule` | 1 |
| `ng-zorro-antd/checkbox` | `NzCheckboxModule` | 2 |
| `ng-zorro-antd/code-editor` | `NzCodeEditorModule` | 1 |
| `ng-zorro-antd/collapse` | `NzCollapseModule` | 2 |
| `ng-zorro-antd/color-picker` | `NzColorPickerModule` | 2 |
| `ng-zorro-antd/comment` | `NzCommentModule` | 5 |
| `ng-zorro-antd/cron-expression` | `NzCronExpressionModule` | 1 |
| `ng-zorro-antd/date-picker` | `NzDatePickerModule` | 6 |
| `ng-zorro-antd/descriptions` | `NzDescriptionsModule` | 2 |
| `ng-zorro-antd/divider` | `NzDividerModule` | 1 |
| `ng-zorro-antd/drawer` | `NzDrawerModule` | 2 |
| `ng-zorro-antd/dropdown` | `NzDropdownModule` | 3 |
| `ng-zorro-antd/empty` | `NzEmptyModule` | 4 |
| `ng-zorro-antd/flex` | `NzFlexModule` | 1 |
| `ng-zorro-antd/float-button` | `NzFloatButtonModule` | 4 |
| `ng-zorro-antd/form` | `NzFormModule` | 6 |
| `ng-zorro-antd/graph` | `NzGraphModule` | 9 |
| `ng-zorro-antd/grid` | `NzGridModule` | 2 |
| `ng-zorro-antd/hash-code` | `NzHashCodeModule` | 1 |
| `ng-zorro-antd/icon` | `NzIconModule` | 1 |
| `ng-zorro-antd/image` | `NzImageModule` | 3 |
| `ng-zorro-antd/input` | `NzInputModule` | 12 |
| `ng-zorro-antd/input-number` | `NzInputNumberModule` | 1 |
| `ng-zorro-antd/layout` | `NzLayoutModule` | 5 |
| `ng-zorro-antd/list` | `NzListModule` | 15 |
| `ng-zorro-antd/mention` | `NzMentionModule` | 3 |
| `ng-zorro-antd/menu` | `NzMenuModule` | 8 |
| `ng-zorro-antd/message` | （服务无模块） | 2 |
| `ng-zorro-antd/modal` | `NzModalModule` | 9 |
| `ng-zorro-antd/notification` | （服务无模块） | 2 |
| `ng-zorro-antd/page-header` | `NzPageHeaderModule` | 9 |
| `ng-zorro-antd/pagination` | `NzPaginationModule` | 5 |
| `ng-zorro-antd/popconfirm` | `NzPopconfirmModule` | 2 |
| `ng-zorro-antd/popover` | `NzPopoverModule` | 2 |
| `ng-zorro-antd/progress` | `NzProgressModule` | 1 |
| `ng-zorro-antd/qr-code` | `NzQRCodeModule` | 1 |
| `ng-zorro-antd/radio` | `NzRadioModule` | 2 |
| `ng-zorro-antd/rate` | `NzRateModule` | 2 |
| `ng-zorro-antd/resizable` | `NzResizableModule` | 3 |
| `ng-zorro-antd/result` | `NzResultModule` | 6 |
| `ng-zorro-antd/segmented` | `NzSegmentedModule` | 2 |
| `ng-zorro-antd/select` | `NzSelectModule` | 12 |
| `ng-zorro-antd/skeleton` | `NzSkeletonModule` | 6 |
| `ng-zorro-antd/slider` | `NzSliderModule` | 1 |
| `ng-zorro-antd/space` | `NzSpaceModule` | 3 |
| `ng-zorro-antd/spin` | `NzSpinModule` | 1 |
| `ng-zorro-antd/splitter` | `NzSplitterModule` | 2 |
| `ng-zorro-antd/statistic` | `NzStatisticModule` | 3 |
| `ng-zorro-antd/steps` | `NzStepsModule` | 2 |
| `ng-zorro-antd/switch` | `NzSwitchModule` | 1 |
| `ng-zorro-antd/table` | `NzTableModule` | 29 |
| `ng-zorro-antd/tabs` | `NzTabsModule` | 6 |
| `ng-zorro-antd/tag` | `NzTagModule` | 1 |
| `ng-zorro-antd/time-picker` | `NzTimePickerModule` | 2 |
| `ng-zorro-antd/timeline` | `NzTimelineModule` | 2 |
| `ng-zorro-antd/tooltip` | `NzTooltipModule` | 2 |
| `ng-zorro-antd/transfer` | `NzTransferModule` | 2 |
| `ng-zorro-antd/tree` | `NzTreeModule` | 6 |
| `ng-zorro-antd/tree-select` | `NzTreeSelectModule` | 1 |
| `ng-zorro-antd/tree-view` | `NzTreeViewModule` | 16 |
| `ng-zorro-antd/typography` | `NzTypographyModule` | 3 |
| `ng-zorro-antd/upload` | `NzUploadModule` | 3 |

## affix

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-affix` | `NzAffixComponent` | Component | `nzTarget`<br>`nzOffsetTop`<br>`nzOffsetBottom` | `nzChange` |

## alert

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-alert` | `NzAlertComponent` | Component | `nzAction`<br>`nzCloseText`<br>`nzIconType`<br>`nzMessage`<br>`nzDescription`<br>`nzType`<br>`nzCloseable`<br>`nzShowIcon`<br>`nzBanner`<br>`nzNoAnimation`<br>`nzIcon` | `nzOnClose` |
| `nz-alert-marquee` | `NzAlertMarqueeComponent` | Component | `nzPauseOnHover`<br>`nzSpeed` | - |

## anchor

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-anchor` | `NzAnchorComponent` | Component | `nzAffix`<br>`nzShowInkInFixed`<br>`nzBounds`<br>`nzOffsetTop`<br>`nzTargetOffset`<br>`nzContainer`<br>`nzCurrentAnchor`<br>`nzDirection` | `nzClick`<br>`nzChange`<br>`nzScroll` |
| `nz-link` | `NzAnchorLinkComponent` | Component | `nzHref`<br>`nzTarget`<br>`nzTitle` | - |

## auto-complete

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-autocomplete` | `NzAutocompleteComponent` | Component | `nzWidth`<br>`nzOverlayClassName`<br>`nzOverlayStyle`<br>`nzDefaultActiveFirstOption`<br>`nzBackfill`<br>`nzDropdownMatchSelectWidth`<br>`compareWith`<br>`nzDataSource` | `selectionChange` |
| `nz-auto-optgroup` | `NzAutocompleteOptgroupComponent` | Component | `nzLabel` | - |
| `nz-auto-option` | `NzAutocompleteOptionComponent` | Component | `nzValue`<br>`nzLabel`<br>`nzDisabled` | `selectionChange`<br>`mouseEntered` |
| `[nzAutocompleteOrigin]` | `NzAutocompleteOriginDirective` | Directive | - | - |
| `input[nzAutocomplete], textarea[nzAutocomplete]` | `NzAutocompleteTriggerDirective` | Directive | `nzAutocomplete`<br>`nzAutocompleteConnectedTo` | - |

## avatar

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-avatar` | `NzAvatarComponent` | Component | `nzShape`<br>`nzSize`<br>`nzGap`<br>`nzText`<br>`nzSrc`<br>`nzSrcSet`<br>`nzAlt`<br>`nzIcon`<br>`nzLoading`<br>`nzFetchPriority` | `nzError` |
| `nz-avatar-group` | `NzAvatarGroupComponent` | Component | - | - |

## badge

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-badge` | `NzBadgeComponent` | Component | `nzShowZero`<br>`nzShowDot`<br>`nzStandalone`<br>`nzDot`<br>`nzOverflowCount`<br>`nzColor`<br>`nzStyle`<br>`nzText`<br>`nzTitle`<br>`nzStatus`<br>`nzCount`<br>`nzOffset`<br>`nzSize` | - |
| `nz-ribbon` | `NzRibbonComponent` | Component | `nzColor`<br>`nzPlacement`<br>`nzText` | - |

## breadcrumb

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-breadcrumb` | `NzBreadCrumbComponent` | Component | `nzAutoGenerate`<br>`nzSeparator`<br>`nzRouteLabel`<br>`nzRouteLabelFn`<br>`nzRouteFn` | - |
| `nz-breadcrumb-item` | `NzBreadCrumbItemComponent` | Component | `nzOverlay` | - |
| `nz-breadcrumb-separator` | `NzBreadCrumbSeparatorComponent` | Component | - | - |

## button

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `button[nz-button], a[nz-button]` | `NzButtonComponent` | Component | `nzBlock`<br>`nzGhost`<br>`nzLoading`<br>`nzDanger`<br>`disabled`<br>`tabIndex`<br>`nzType`<br>`nzShape`<br>`nzSize` | - |

## calendar

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-calendar` | `NzCalendarComponent` | Component | `nzMode`<br>`nzValue`<br>`nzDisabledDate`<br>`nzDateCell`<br>`nzDateFullCell`<br>`nzMonthCell`<br>`nzMonthFullCell`<br>`nzCustomHeader`<br>`nzFullscreen` | `nzModeChange`<br>`nzPanelChange`<br>`nzSelectChange`<br>`nzValueChange` |
| `nz-calendar-header` | `NzCalendarHeaderComponent` | Component | `mode`<br>`fullscreen`<br>`activeDate`<br>`nzCustomHeader` | `modeChange`<br>`yearChange`<br>`monthChange` |
| `[nzDateCell]` | `NzDateCellDirective` | Directive | - | - |
| `[nzDateFullCell]` | `NzDateFullCellDirective` | Directive | - | - |
| `[nzMonthCell]` | `NzMonthCellDirective` | Directive | - | - |
| `[nzMonthFullCell]` | `NzMonthFullCellDirective` | Directive | - | - |

## card

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-card` | `NzCardComponent` | Component | `nzBordered`<br>`nzLoading`<br>`nzHoverable`<br>`nzBodyStyle`<br>`nzCover`<br>`nzActions`<br>`nzType`<br>`nzSize`<br>`nzTitle`<br>`nzExtra` | - |
| `[nz-card-grid]` | `NzCardGridDirective` | Directive | `nzHoverable` | - |
| `nz-card-meta` | `NzCardMetaComponent` | Component | `nzTitle`<br>`nzDescription`<br>`nzAvatar` | - |
| `nz-card-tab` | `NzCardTabComponent` | Component | - | - |

## carousel

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-carousel` | `NzCarouselComponent` | Component | `nzDotRender`<br>`nzEffect`<br>`nzEnableSwipe`<br>`nzDots`<br>`nzAutoPlay`<br>`nzAutoPlaySpeed`<br>`nzTransitionSpeed`<br>`nzLoop`<br>`nzArrows`<br>`nzStrategyOptions`<br>`nzDotPosition` | `nzBeforeChange`<br>`nzAfterChange` |
| `[nz-carousel-content]` | `NzCarouselContentDirective` | Directive | - | - |

## cascader

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-cascader, [nz-cascader]` | `NzCascaderComponent` | Component | `nzOpen`<br>`nzOptions`<br>`nzOptionRender`<br>`nzShowInput`<br>`nzShowArrow`<br>`nzAllowClear`<br>`nzAutoFocus`<br>`nzChangeOnSelect`<br>`nzDisabled`<br>`nzColumnClassName`<br>`nzExpandTrigger`<br>`nzValueProperty`<br>`nzLabelProperty`<br>`nzLabelRender`<br>`nzVariant`<br>`nzNotFoundContent`<br>`nzSize`<br>`nzBackdrop`<br>`nzShowSearch`<br>`nzPlaceHolder`<br>`nzMenuClassName`<br>`nzMenuStyle`<br>`nzMouseLeaveDelay`<br>`nzMouseEnterDelay`<br>`nzStatus`<br>`nzMultiple`<br>`nzMaxTagCount`<br>`nzPlacement`<br>`nzTriggerAction`<br>`nzChangeOn`<br>`nzLoadData`<br>`nzPrefix`<br>`nzSuffixIcon`<br>`nzExpandIcon`<br>`nzPopupRender` | `nzVisibleChange`<br>`nzOpenChange`<br>`nzSelectionChange`<br>`nzRemoved`<br>`nzClear` |
| `[nz-cascader-option]` | `NzCascaderOptionComponent` | Component | `optionTemplate`<br>`node`<br>`activated`<br>`highlightText`<br>`nzLabelProperty`<br>`columnIndex`<br>`expandIcon`<br>`dir`<br>`checkable` | `check` |

## check-list

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-check-list` | `NzCheckListComponent` | Component | `nzItems`<br>`nzVisible`<br>`nzIndex`<br>`nzProgress`<br>`nzTriggerRender`<br>`nzTitle`<br>`nzFooter` | `nzHide` |

## checkbox

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-checkbox]` | `NzCheckboxComponent` | Component | `nzValue`<br>`nzAutoFocus`<br>`nzDisabled`<br>`nzIndeterminate`<br>`nzChecked`<br>`nzId`<br>`nzName` | `nzCheckedChange` |
| `nz-checkbox-group` | `NzCheckboxGroupComponent` | Component | `nzName`<br>`nzDisabled`<br>`nzOptions` | - |

## code-editor

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-code-editor` | `NzCodeEditorComponent` | Component | `nzEditorMode`<br>`nzOriginalText`<br>`nzLoading`<br>`nzFullControl`<br>`nzToolkit`<br>`nzEditorOption` | `nzEditorInitialized` |

## collapse

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-collapse` | `NzCollapseComponent` | Component | `nzAccordion`<br>`nzBordered`<br>`nzGhost`<br>`nzExpandIconPosition`<br>`nzSize` | - |
| `nz-collapse-panel` | `NzCollapsePanelComponent` | Component | `nzActive`<br>`nzShowArrow`<br>`nzExtra`<br>`nzHeader`<br>`nzExpandedIcon`<br>`nzCollapsible` | `nzActiveChange` |

## color-picker

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-color-block` | `NzColorBlockComponent` | Component | `nzColor`<br>`nzSize` | `nzOnClick` |
| `nz-color-picker` | `NzColorPickerComponent` | Component | `nzFormat`<br>`nzValue`<br>`nzSize`<br>`nzDefaultValue`<br>`nzTrigger`<br>`nzTitle`<br>`nzFlipFlop`<br>`nzShowText`<br>`nzOpen`<br>`nzAllowClear`<br>`nzDisabled`<br>`nzDisabledAlpha`<br>`nzPresets` | `nzOnChange`<br>`nzOnFormatChange`<br>`nzOnClear`<br>`nzOnOpenChange` |

## comment

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-comment-action` | `NzCommentActionComponent` | Component | - | - |
| `[nzCommentActionHost]` | `NzCommentActionHostDirective` | Directive | `nzCommentActionHost` | - |
| `nz-avatar[nz-comment-avatar]` | `NzCommentAvatarDirective` | Directive | - | - |
| `nz-comment` | `NzCommentComponent` | Component | `nzAuthor`<br>`nzDatetime` | - |
| `nz-comment-content, [nz-comment-content]` | `NzCommentContentDirective` | Directive | - | - |

## cron-expression

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-cron-expression` | `NzCronExpressionComponent` | Component | `nzStatus`<br>`nzSize`<br>`nzType`<br>`nzCollapseDisable`<br>`nzExtra`<br>`nzSemantic`<br>`nzBorderless`<br>`nzDisabled` | - |

## date-picker

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-date-picker,nz-week-picker,nz-month-picker,nz-quarter-picker,nz-year-picker,nz-range-picker` | `NzDatePickerComponent` | Component | `nzInline`<br>`nzAllowClear`<br>`nzAutoFocus`<br>`nzDisabled`<br>`nzInputReadOnly`<br>`nzOpen`<br>`nzDisabledDate`<br>`nzLocale`<br>`nzPlaceHolder`<br>`nzPopupStyle`<br>`nzDropdownClassName`<br>`nzSize`<br>`nzStatus`<br>`nzFormat`<br>`nzVariant`<br>`nzDateRender`<br>`nzDisabledTime`<br>`nzRenderExtraFooter`<br>`nzShowToday`<br>`nzMode`<br>`nzShowNow`<br>`nzRanges`<br>`nzDefaultPickerValue`<br>`nzSeparator`<br>`nzSuffixIcon`<br>`nzBackdrop`<br>`nzId`<br>`nzPlacement`<br>`nzShowWeekNumber`<br>`nzShowTime` | `nzOnPanelChange`<br>`nzOnCalendarChange`<br>`nzOnOk`<br>`nzOnOpenChange` |
| `nz-month-picker` | `NzMonthPickerComponent` | Directive | - | - |
| `nz-quarter-picker` | `NzQuarterPickerComponent` | Directive | - | - |
| `nz-range-picker` | `NzRangePickerComponent` | Directive | - | - |
| `nz-week-picker` | `NzWeekPickerComponent` | Directive | - | - |
| `nz-year-picker` | `NzYearPickerComponent` | Directive | - | - |

## descriptions

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-descriptions` | `NzDescriptionsComponent` | Component | `nzBordered`<br>`nzLayout`<br>`nzColumn`<br>`nzSize`<br>`nzTitle`<br>`nzExtra`<br>`nzColon` | - |
| `nz-descriptions-item` | `NzDescriptionsItemComponent` | Component | `nzSpan`<br>`nzTitle` | - |

## divider

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-divider` | `NzDividerComponent` | Component | `nzText`<br>`nzType`<br>`nzOrientation`<br>`nzVariant`<br>`nzSize`<br>`nzDashed`<br>`nzPlain` | - |

## drawer

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-drawer` | `NzDrawerComponent` | Component | `nzContent`<br>`nzCloseIcon`<br>`nzClosable`<br>`nzMaskClosable`<br>`nzMask`<br>`nzCloseOnNavigation`<br>`nzNoAnimation`<br>`nzKeyboard`<br>`nzTitle`<br>`nzExtra`<br>`nzFooter`<br>`nzPlacement`<br>`nzSize`<br>`nzMaskStyle`<br>`nzBodyStyle`<br>`nzWrapClassName`<br>`nzWidth`<br>`nzHeight`<br>`nzZIndex`<br>`nzOffsetX`<br>`nzOffsetY`<br>`nzVisible` | `nzOnViewInit`<br>`nzOnClose`<br>`nzVisibleChange` |
| `[nzDrawerContent]` | `NzDrawerContentDirective` | Directive | - | - |

## dropdown

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `a[nz-dropdown]` | `NzDropdownADirective` | Directive | - | - |
| `[nz-dropdown]` | `NzDropdownDirective` | Directive | `nzDropdownMenu`<br>`nzTrigger`<br>`nzMatchWidthElement`<br>`nzBackdrop`<br>`nzClickHide`<br>`nzDisabled`<br>`nzVisible`<br>`nzArrow`<br>`nzOverlayClassName`<br>`nzOverlayStyle`<br>`nzPlacement` | `nzVisibleChange` |
| `nz-dropdown-menu` | `NzDropdownMenuComponent` | Component | - | - |

## empty

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-embed-empty` | `NzEmbedEmptyComponent` | Component | `nzComponentName`<br>`specificContent` | - |
| `nz-empty` | `NzEmptyComponent` | Component | `nzNotFoundImage`<br>`nzNotFoundContent`<br>`nzNotFoundFooter` | - |
| `nz-empty-default` | `NzEmptyDefaultComponent` | Component | - | - |
| `nz-empty-simple` | `NzEmptySimpleComponent` | Component | - | - |

## flex

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-flex],nz-flex` | `NzFlexDirective` | Directive | `nzVertical`<br>`nzJustify`<br>`nzAlign`<br>`nzGap`<br>`nzWrap`<br>`nzFlex` | - |

## float-button

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-float-button` | `NzFloatButtonComponent` | Component | `nzHref`<br>`nzTarget`<br>`nzType`<br>`nzIcon`<br>`nzDescription`<br>`nzShape`<br>`nzBadge` | `nzOnClick` |
| `nz-float-button-content` | `NzFloatButtonContentComponent` | Component | `nzBadge`<br>`nzIcon`<br>`nzDescription`<br>`nzShape` | - |
| `nz-float-button-group` | `NzFloatButtonGroupComponent` | Component | `nzHref`<br>`nzTarget`<br>`nzType`<br>`nzIcon`<br>`nzDescription`<br>`nzShape`<br>`nzTrigger`<br>`nzOpen`<br>`nzPlacement` | `nzOnOpenChange`<br>`nzOpenChange` |
| `nz-float-button-top` | `NzFloatButtonTopComponent` | Component | `nzVisibilityHeight`<br>`nzHref`<br>`nzType`<br>`nzShape`<br>`nzIcon`<br>`nzDescription`<br>`nzTemplate`<br>`nzTarget`<br>`nzDuration`<br>`nzBadge` | `nzOnClick` |

## form

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-form-control` | `NzFormControlComponent` | Component | `nzSuccessTip`<br>`nzWarningTip`<br>`nzErrorTip`<br>`nzValidatingTip`<br>`nzExtra`<br>`nzAutoTips`<br>`nzDisableAutoTips`<br>`nzHasFeedback`<br>`nzValidateStatus` | - |
| `[nz-form]` | `NzFormDirective` | Directive | `nzLayout`<br>`nzNoColon`<br>`nzAutoTips`<br>`nzDisableAutoTips`<br>`nzTooltipIcon`<br>`nzLabelAlign`<br>`nzLabelWrap`<br>`nzSize`<br>`nzVariant`<br>`nzRequiredMark` | - |
| `nz-form-item` | `NzFormItemComponent` | Component | `nzLayout` | - |
| `nz-form-label` | `NzFormLabelComponent` | Component | `nzFor`<br>`nzRequired`<br>`nzNoColon`<br>`nzTooltipTitle`<br>`nzTooltipIcon`<br>`nzLabelAlign`<br>`nzLabelWrap` | - |
| `nz-form-split` | `NzFormSplitComponent` | Component | - | - |
| `nz-form-text` | `NzFormTextComponent` | Component | - | - |

## graph

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-graph` | `NzGraphComponent` | Component | `nzGraphData`<br>`nzRankDirection`<br>`nzGraphLayoutConfig`<br>`nzAutoSize` | `nzGraphInitialized`<br>`nzGraphRendered`<br>`nzNodeClick` |
| `svg:defs[nz-graph-defs]` | `NzGraphDefsComponent` | Component | - | - |
| `[nz-graph-edge]` | `NzGraphEdgeComponent` | Component | `edge`<br>`edgeType`<br>`customTemplate` | - |
| `[nzGraphEdge]` | `NzGraphEdgeDirective` | Directive | - | - |
| `[nzGraphGroupNode]` | `NzGraphGroupNodeDirective` | Directive | - | - |
| `nz-graph-minimap` | `NzGraphMinimapComponent` | Component | - | - |
| `[nz-graph-node]` | `NzGraphNodeComponent` | Component | `node`<br>`customTemplate` | - |
| `[nzGraphNode]` | `NzGraphNodeDirective` | Directive | - | - |
| `[nz-graph-zoom]` | `NzGraphZoomDirective` | Directive | `nzZoom`<br>`nzMinZoom`<br>`nzMaxZoom` | `nzTransformEvent`<br>`nzZoomChange` |

## grid

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-col],nz-col,nz-form-control,nz-form-label` | `NzColDirective` | Directive | `nzFlex`<br>`nzSpan`<br>`nzOrder`<br>`nzOffset`<br>`nzPush`<br>`nzPull`<br>`nzXs`<br>`nzSm`<br>`nzMd`<br>`nzLg`<br>`nzXl`<br>`nzXXl`<br>`nzXXXl` | - |
| `[nz-row],nz-row,nz-form-item` | `NzRowDirective` | Directive | `nzAlign`<br>`nzJustify`<br>`nzGutter`<br>`nzWrap` | - |

## hash-code

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-hash-code` | `NzHashCodeComponent` | Component | `nzValue`<br>`nzTitle`<br>`nzLogo`<br>`nzMode`<br>`nzType` | `nzOnCopy` |

## icon

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-icon,[nz-icon]` | `NzIconDirective` | Directive | `nzType`<br>`nzTheme`<br>`nzTwotoneColor`<br>`nzSpin`<br>`nzRotate`<br>`nzIconfont`<br>`ariaLabel as aria-label` | - |

## image

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `img[nz-image]` | `NzImageDirective` | Directive | `nzSrc`<br>`nzSrcset`<br>`nzDisablePreview`<br>`nzFallback`<br>`nzPlaceholder`<br>`nzScaleStep` | - |
| `nz-image-group` | `NzImageGroupComponent` | Component | `nzScaleStep` | - |
| `nz-image-preview` | `NzImagePreviewComponent` | Component | - | - |

## input

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nzInputAddonAfter]` | `NzInputAddonAfterDirective` | Directive | - | - |
| `[nzInputAddonBefore]` | `NzInputAddonBeforeDirective` | Directive | - | - |
| `input[nz-input],textarea[nz-input]` | `NzInputDirective` | Directive | `nzVariant`<br>`nzSize`<br>`nzStatus`<br>`disabled`<br>`readonly` | - |
| `nz-input-otp` | `NzInputOtpComponent` | Component | `nzLength`<br>`nzSize`<br>`disabled`<br>`nzStatus`<br>`nzFormatter`<br>`nzMask` | - |
| `nz-input-password` | `NzInputPasswordDirective` | Directive | `nzVisibilityToggle`<br>`nzVisible` | `nzVisible as nzVisibleChange` |
| `[nzInputPasswordIcon]` | `NzInputPasswordIconDirective` | Directive | - | - |
| `[nzInputPrefix]` | `NzInputPrefixDirective` | Directive | - | - |
| `nz-input-search` | `NzInputSearchDirective` | Directive | `nzEnterButton`<br>`nzLoading` | `nzSearch` |
| `[nzInputSearchEnterButton]` | `NzInputSearchEnterButtonDirective` | Directive | - | - |
| `[nzInputSuffix]` | `NzInputSuffixDirective` | Directive | - | - |
| `nz-input-wrapper,nz-input-password,nz-input-search` | `NzInputWrapperComponent` | Component | `nzAllowClear`<br>`nzPrefix`<br>`nzSuffix`<br>`nzAddonBefore`<br>`nzAddonAfter`<br>`nzShowCount`<br>`nzCount` | `nzClear` |
| `nz-textarea-count` | `NzTextareaCountComponent` | Component | `nzMaxCharacterCount`<br>`nzComputeCharacterCount`<br>`nzFormatter` | - |

## input-number

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-input-number` | `NzInputNumberComponent` | Component | `nzId`<br>`nzSize`<br>`nzPlaceHolder`<br>`nzStatus`<br>`nzVariant`<br>`nzStep`<br>`nzMin`<br>`nzMax`<br>`nzPrecision`<br>`nzParser`<br>`nzFormatter`<br>`nzDisabled`<br>`nzReadOnly`<br>`nzAutoFocus`<br>`nzKeyboard`<br>`nzControls`<br>`nzChangeOnWheel`<br>`nzPrefix`<br>`nzSuffix`<br>`nzAddonBefore`<br>`nzAddonAfter` | `nzBlur`<br>`nzFocus`<br>`nzOnStep` |

## layout

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-content` | `NzContentComponent` | Component | - | - |
| `nz-footer` | `NzFooterComponent` | Component | - | - |
| `nz-header` | `NzHeaderComponent` | Component | - | - |
| `nz-layout` | `NzLayoutComponent` | Component | - | - |
| `nz-sider` | `NzSiderComponent` | Component | `nzWidth`<br>`nzTheme`<br>`nzCollapsedWidth`<br>`nzBreakpoint`<br>`nzZeroTrigger`<br>`nzTrigger`<br>`nzReverseArrow`<br>`nzCollapsible`<br>`nzCollapsed` | `nzCollapsedChange` |

## list

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-list, [nz-list]` | `NzListComponent` | Component | `nzDataSource`<br>`nzBordered`<br>`nzGrid`<br>`nzHeader`<br>`nzFooter`<br>`nzItemLayout`<br>`nzRenderItem`<br>`nzLoading`<br>`nzLoadMore`<br>`nzPagination`<br>`nzSize`<br>`nzSplit`<br>`nzNoResult` | - |
| `nz-list-empty` | `NzListEmptyComponent` | Component | `nzNoResult` | - |
| `nz-list-footer` | `NzListFooterComponent` | Component | - | - |
| `nz-list[nzGrid]` | `NzListGridDirective` | Directive | - | - |
| `nz-list-header` | `NzListHeaderComponent` | Component | - | - |
| `nz-list-item-action` | `NzListItemActionComponent` | Component | - | - |
| `ul[nz-list-item-actions]` | `NzListItemActionsComponent` | Component | `nzActions` | - |
| `nz-list-item, [nz-list-item]` | `NzListItemComponent` | Component | `nzActions`<br>`nzContent`<br>`nzExtra`<br>`nzNoFlex` | - |
| `nz-list-item-extra, [nz-list-item-extra]` | `NzListItemExtraComponent` | Component | - | - |
| `nz-list-item-meta-avatar` | `NzListItemMetaAvatarComponent` | Component | `nzSrc` | - |
| `nz-list-item-meta, [nz-list-item-meta]` | `NzListItemMetaComponent` | Component | `nzAvatar`<br>`nzTitle`<br>`nzDescription` | - |
| `nz-list-item-meta-description` | `NzListItemMetaDescriptionComponent` | Component | - | - |
| `nz-list-item-meta-title` | `NzListItemMetaTitleComponent` | Component | - | - |
| `nz-list-load-more` | `NzListLoadMoreDirective` | Directive | - | - |
| `nz-list-pagination` | `NzListPaginationComponent` | Component | - | - |

## mention

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-mention` | `NzMentionComponent` | Component | `nzValueWith`<br>`nzPrefix`<br>`nzLoading`<br>`nzNotFoundContent`<br>`nzPlacement`<br>`nzSuggestions`<br>`nzStatus`<br>`nzVariant`<br>`nzAllowClear`<br>`nzClearIcon` | `nzOnSelect`<br>`nzOnSearchChange`<br>`nzOnClear` |
| `[nzMentionSuggestion]` | `NzMentionSuggestionDirective` | Directive | - | - |
| `input[nzMentionTrigger], textarea[nzMentionTrigger]` | `NzMentionTriggerDirective` | Directive | - | `onFocusin`<br>`onBlur`<br>`onInput`<br>`onKeydown`<br>`onClick` |

## menu

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-menu]` | `NzMenuDirective` | Directive | `nzInlineIndent`<br>`nzTheme`<br>`nzMode`<br>`nzInlineCollapsed`<br>`nzSelectable` | `nzClick` |
| `[nz-menu-divider]` | `NzMenuDividerDirective` | Directive | - | - |
| `[nz-menu-group]` | `NzMenuGroupComponent` | Component | `nzTitle` | - |
| `[nz-menu-item]` | `NzMenuItemComponent` | Component | `nzPaddingLeft`<br>`nzDisabled`<br>`nzSelected`<br>`nzDanger`<br>`nzMatchRouterExact`<br>`nzMatchRouter` | - |
| `[nz-submenu]` | `NzSubMenuComponent` | Component | `nzMenuClassName`<br>`nzPaddingLeft`<br>`nzTitle`<br>`nzIcon`<br>`nzTriggerSubMenuAction`<br>`nzOpen`<br>`nzDisabled`<br>`nzPlacement` | `nzOpenChange` |
| `[nz-submenu-inline-child]` | `NzSubmenuInlineChildComponent` | Component | `menuClass`<br>`open`<br>`leavedClassName` | - |
| `[nz-submenu-none-inline-child]` | `NzSubmenuNoneInlineChildComponent` | Component | `menuClass`<br>`theme`<br>`mode`<br>`position`<br>`open`<br>`nzDisabled`<br>`nzTriggerSubMenuAction` | `subMenuMouseState` |
| `[nz-submenu-title]` | `NzSubMenuTitleComponent` | Component | `nzIcon`<br>`nzTitle`<br>`nzDisabled`<br>`paddingLeft`<br>`mode`<br>`nzTriggerSubMenuAction` | `toggleSubMenu`<br>`subMenuMouseState` |

## message

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-message` | `NzMessageComponent` | Component | `instance` | `destroyed` |
| `nz-message-container` | `NzMessageContainerComponent` | Component | - | - |

## modal

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `button[nz-modal-close]` | `NzModalCloseComponent` | Component | - | - |
| `nz-modal` | `NzModalComponent` | Component | `nzMask`<br>`nzMaskClosable`<br>`nzCloseOnNavigation`<br>`nzVisible`<br>`nzClosable`<br>`nzOkLoading`<br>`nzOkDisabled`<br>`nzCancelDisabled`<br>`nzCancelLoading`<br>`nzKeyboard`<br>`nzNoAnimation`<br>`nzCentered`<br>`nzDraggable`<br>`nzContent`<br>`nzFooter`<br>`nzZIndex`<br>`nzWidth`<br>`nzWrapClassName`<br>`nzClassName`<br>`nzStyle`<br>`nzTitle`<br>`nzCloseIcon`<br>`nzMaskStyle`<br>`nzBodyStyle`<br>`nzOkText`<br>`nzCancelText`<br>`nzOkType`<br>`nzOkDanger`<br>`nzIconType`<br>`nzModalType`<br>`nzAutofocus` | `nzOnOk`<br>`nzOnCancel`<br>`nzAfterOpen`<br>`nzAfterClose`<br>`nzVisibleChange` |
| `nz-modal-confirm-container` | `NzModalConfirmContainerComponent` | Component | - | `cancelTriggered`<br>`okTriggered` |
| `nz-modal-container` | `NzModalContainerComponent` | Component | - | - |
| `[nzModalContent]` | `NzModalContentDirective` | Directive | - | - |
| `div[nz-modal-footer]` | `NzModalFooterComponent` | Component | `modalRef` | `cancelTriggered`<br>`okTriggered` |
| `[nzModalFooter]` | `NzModalFooterDirective` | Directive | - | - |
| `div[nz-modal-title]` | `NzModalTitleComponent` | Component | - | - |
| `[nzModalTitle]` | `NzModalTitleDirective` | Directive | - | - |

## notification

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-notification` | `NzNotificationComponent` | Component | `instance`<br>`index`<br>`placement` | `destroyed` |
| `nz-notification-container` | `NzNotificationContainerComponent` | Component | - | - |

## page-header

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-avatar[nz-page-header-avatar]` | `NzPageHeaderAvatarDirective` | Directive | - | - |
| `nz-breadcrumb[nz-page-header-breadcrumb]` | `NzPageHeaderBreadcrumbDirective` | Directive | - | - |
| `nz-page-header` | `NzPageHeaderComponent` | Component | `nzBackIcon`<br>`nzTitle`<br>`nzSubtitle`<br>`nzGhost` | `nzBack` |
| `nz-page-header-content, [nz-page-header-content]` | `NzPageHeaderContentDirective` | Directive | - | - |
| `nz-page-header-extra, [nz-page-header-extra]` | `NzPageHeaderExtraDirective` | Directive | - | - |
| `nz-page-header-footer, [nz-page-header-footer]` | `NzPageHeaderFooterDirective` | Directive | - | - |
| `nz-page-header-subtitle, [nz-page-header-subtitle]` | `NzPageHeaderSubtitleDirective` | Directive | - | - |
| `nz-page-header-tags, [nz-page-header-tags]` | `NzPageHeaderTagDirective` | Directive | - | - |
| `nz-page-header-title, [nz-page-header-title]` | `NzPageHeaderTitleDirective` | Directive | - | - |

## pagination

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-pagination` | `NzPaginationComponent` | Component | `nzShowTotal`<br>`nzItemRender`<br>`nzSize`<br>`nzPageSizeOptions`<br>`nzShowSizeChanger`<br>`nzShowQuickJumper`<br>`nzSimple`<br>`nzDisabled`<br>`nzResponsive`<br>`nzHideOnSinglePage`<br>`nzTotal`<br>`nzPageIndex`<br>`nzPageSize`<br>`nzAlign` | `nzPageSizeChange`<br>`nzPageIndexChange` |
| `nz-pagination-default` | `NzPaginationDefaultComponent` | Component | `nzSize`<br>`itemRender`<br>`showTotal`<br>`disabled`<br>`locale`<br>`showSizeChanger`<br>`showQuickJumper`<br>`total`<br>`pageIndex`<br>`pageSize`<br>`pageSizeOptions` | `pageIndexChange`<br>`pageSizeChange` |
| `li[nz-pagination-item]` | `NzPaginationItemComponent` | Component | `active`<br>`locale`<br>`index`<br>`disabled`<br>`direction`<br>`type`<br>`itemRender` | `diffIndex`<br>`gotoIndex` |
| `li[nz-pagination-options]` | `NzPaginationOptionsComponent` | Component | `nzSize`<br>`disabled`<br>`showSizeChanger`<br>`showQuickJumper`<br>`locale`<br>`total`<br>`pageIndex`<br>`pageSize`<br>`pageSizeOptions` | `pageIndexChange`<br>`pageSizeChange` |
| `nz-pagination-simple` | `NzPaginationSimpleComponent` | Component | `itemRender`<br>`disabled`<br>`locale`<br>`total`<br>`pageIndex`<br>`pageSize` | `pageIndexChange` |

## popconfirm

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-popconfirm` | `NzPopconfirmComponent` | Component | - | - |
| `[nz-popconfirm]` | `NzPopconfirmDirective` | Directive | `arrowPointAtCenter as nzPopconfirmArrowPointAtCenter`<br>`title as nzPopconfirmTitle`<br>`titleContext as nzPopconfirmTitleContext`<br>`directiveTitle as nz-popconfirm`<br>`trigger as nzPopconfirmTrigger`<br>`placement as nzPopconfirmPlacement`<br>`origin as nzPopconfirmOrigin`<br>`mouseEnterDelay as nzPopconfirmMouseEnterDelay`<br>`mouseLeaveDelay as nzPopconfirmMouseLeaveDelay`<br>`overlayClassName as nzPopconfirmOverlayClassName`<br>`overlayStyle as nzPopconfirmOverlayStyle`<br>`visible as nzPopconfirmVisible`<br>`nzBeforeConfirm`<br>`nzIcon`<br>`nzCondition`<br>`nzPopconfirmShowArrow`<br>`nzPopconfirmBackdrop`<br>`nzAutofocus`<br>`nzOkText`<br>`nzOkType`<br>`nzCancelText`<br>`nzOkButtonProps`<br>`nzCancelButtonProps`<br>`nzOkDisabled`<br>`nzOkDanger` | `visibleChange as nzPopconfirmVisibleChange`<br>`nzOnCancel`<br>`nzOnConfirm` |

## popover

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-popover` | `NzPopoverComponent` | Component | - | - |
| `[nz-popover]` | `NzPopoverDirective` | Directive | `arrowPointAtCenter as nzPopoverArrowPointAtCenter`<br>`title as nzPopoverTitle`<br>`titleContext as nzPopoverTitleContext`<br>`content as nzPopoverContent`<br>`contentContext as nzPopoverContentContext`<br>`directiveTitle as nz-popover`<br>`trigger as nzPopoverTrigger`<br>`placement as nzPopoverPlacement`<br>`origin as nzPopoverOrigin`<br>`visible as nzPopoverVisible`<br>`mouseEnterDelay as nzPopoverMouseEnterDelay`<br>`mouseLeaveDelay as nzPopoverMouseLeaveDelay`<br>`overlayClassName as nzPopoverOverlayClassName`<br>`overlayStyle as nzPopoverOverlayStyle`<br>`overlayClickable as nzPopoverOverlayClickable`<br>`nzPopoverBackdrop` | `visibleChange as nzPopoverVisibleChange` |

## progress

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-progress` | `NzProgressComponent` | Component | `nzShowInfo`<br>`nzWidth`<br>`nzStrokeColor`<br>`nzSize`<br>`nzFormat`<br>`nzSuccessPercent`<br>`nzPercent`<br>`nzStrokeWidth`<br>`nzGapDegree`<br>`nzStatus`<br>`nzType`<br>`nzGapPosition`<br>`nzStrokeLinecap`<br>`nzSteps` | - |

## qr-code

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-qrcode` | `NzQRCodeComponent` | Component | `nzValue`<br>`nzType`<br>`nzColor`<br>`nzBgColor`<br>`nzSize`<br>`nzIcon`<br>`nzIconSize`<br>`nzBordered`<br>`nzStatus`<br>`nzLevel`<br>`nzStatusRender`<br>`nzBoostLevel`<br>`nzPadding` | `nzRefresh` |

## radio

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-radio],[nz-radio-button]` | `NzRadioComponent` | Component | `nzValue`<br>`nzDisabled`<br>`nzAutoFocus`<br>`isRadioButton as nz-radio-button` | - |
| `nz-radio-group` | `NzRadioGroupComponent` | Component | `nzDisabled`<br>`nzButtonStyle`<br>`nzSize`<br>`nzName` | - |

## rate

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-rate` | `NzRateComponent` | Component | `nzAllowClear`<br>`nzAllowHalf`<br>`nzDisabled`<br>`nzAutoFocus`<br>`nzCharacter`<br>`nzCount`<br>`nzTooltips` | `nzOnBlur`<br>`nzOnFocus`<br>`nzOnHoverChange`<br>`nzOnKeyDown` |
| `[nz-rate-item]` | `NzRateItemComponent` | Component | `character`<br>`index`<br>`allowHalf` | `itemHover`<br>`itemClick` |

## resizable

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-resizable]` | `NzResizableDirective` | Directive | `nzBounds`<br>`nzMaxHeight`<br>`nzMaxWidth`<br>`nzMinHeight`<br>`nzMinWidth`<br>`nzGridColumnCount`<br>`nzMaxColumn`<br>`nzMinColumn`<br>`nzLockAspectRatio`<br>`nzPreview`<br>`nzDisabled` | `nzResize`<br>`nzResizeEnd`<br>`nzResizeStart` |
| `nz-resize-handle, [nz-resize-handle]` | `NzResizeHandleComponent` | Component | `nzDirection`<br>`nzCursorType` | `nzMouseDown` |
| `nz-resize-handles` | `NzResizeHandlesComponent` | Component | `nzDirections` | - |

## result

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-result` | `NzResultComponent` | Component | `nzIcon`<br>`nzTitle`<br>`nzSubTitle`<br>`nzExtra`<br>`nzStatus` | - |
| `div[nz-result-content]` | `NzResultContentDirective` | Directive | - | - |
| `div[nz-result-extra]` | `NzResultExtraDirective` | Directive | - | - |
| `[nz-result-icon]` | `NzResultIconDirective` | Directive | - | - |
| `div[nz-result-subtitle]` | `NzResultSubtitleDirective` | Directive | - | - |
| `div[nz-result-title]` | `NzResultTitleDirective` | Directive | - | - |

## segmented

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-segmented` | `NzSegmentedComponent` | Component | `nzBlock`<br>`nzDisabled`<br>`nzOptions`<br>`nzVertical`<br>`nzShape`<br>`nzSize`<br>`nzName` | `nzValueChange` |
| `label[nz-segmented-item],label[nzSegmentedItem]` | `NzSegmentedItemComponent` | Component | `nzValue`<br>`nzIcon`<br>`nzDisabled` | - |

## select

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-option` | `NzOptionComponent` | Component | `nzTitle`<br>`nzLabel`<br>`nzValue`<br>`nzKey`<br>`nzDisabled`<br>`nzHide`<br>`nzCustomContent` | - |
| `nz-option-container` | `NzOptionContainerComponent` | Component | `notFoundContent`<br>`menuItemSelectedIcon`<br>`dropdownRender`<br>`activatedValue`<br>`listOfSelectedValue`<br>`compareWith`<br>`mode`<br>`matchWidth`<br>`itemSize`<br>`maxItemLength`<br>`isMaxMultipleCountReached`<br>`listOfContainerItem` | `itemClick`<br>`scrollToBottom` |
| `nz-option-group` | `NzOptionGroupComponent` | Component | `nzLabel` | - |
| `nz-option-item` | `NzOptionItemComponent` | Component | `grouped`<br>`customContent`<br>`template`<br>`disabled`<br>`showState`<br>`title`<br>`label`<br>`value`<br>`activatedValue`<br>`listOfSelectedValue`<br>`icon`<br>`compareWith` | `itemClick`<br>`itemHover` |
| `nz-option-item-group` | `NzOptionItemGroupComponent` | Component | `nzLabel` | - |
| `nz-select-arrow` | `NzSelectArrowComponent` | Component | `listOfValue`<br>`loading`<br>`search`<br>`showArrow`<br>`isMaxMultipleCountSet`<br>`suffixIcon`<br>`feedbackIcon`<br>`nzMaxMultipleCount` | - |
| `nz-select-clear` | `NzSelectClearComponent` | Component | `clearIcon` | `clear` |
| `nz-select` | `NzSelectComponent` | Component | `nzId`<br>`nzSize`<br>`nzStatus`<br>`nzVariant`<br>`nzOptionHeightPx`<br>`nzOptionOverflowSize`<br>`nzDropdownClassName`<br>`nzDropdownMatchSelectWidth`<br>`nzDropdownStyle`<br>`nzNotFoundContent`<br>`nzPlaceHolder`<br>`nzPlacement`<br>`nzMaxTagCount`<br>`nzDropdownRender`<br>`nzCustomTemplate`<br>`nzPrefix`<br>`nzSuffixIcon`<br>`nzClearIcon`<br>`nzRemoveIcon`<br>`nzMenuItemSelectedIcon`<br>`nzTokenSeparators`<br>`nzMaxTagPlaceholder`<br>`nzMaxMultipleCount`<br>`nzMode`<br>`nzFilterOption`<br>`compareWith`<br>`nzAllowClear`<br>`nzShowSearch`<br>`nzLoading`<br>`nzAutoFocus`<br>`nzAutoClearSearchValue`<br>`nzServerSearch`<br>`nzDisabled`<br>`nzOpen`<br>`nzSelectOnTab`<br>`nzBackdrop`<br>`nzOptions`<br>`nzShowArrow` | `nzOnSearch`<br>`nzScrollToBottom`<br>`nzOpenChange`<br>`nzBlur`<br>`nzFocus`<br>`nzOnClear` |
| `nz-select-item` | `NzSelectItemComponent` | Component | `disabled`<br>`label`<br>`displayLabelInHtml`<br>`deletable`<br>`removeIcon`<br>`contentTemplateOutletContext`<br>`contentTemplateOutlet` | `delete` |
| `nz-select-placeholder` | `NzSelectPlaceholderComponent` | Component | `placeholder` | - |
| `nz-select-search` | `NzSelectSearchComponent` | Component | `nzId`<br>`disabled`<br>`mirrorSync`<br>`showInput`<br>`focusTrigger`<br>`value`<br>`autofocus` | `valueChange`<br>`isComposingChange` |
| `nz-select-top-control` | `NzSelectTopControlComponent` | Component | `nzId`<br>`showSearch`<br>`placeHolder`<br>`open`<br>`maxTagCount`<br>`autofocus`<br>`disabled`<br>`mode`<br>`customTemplate`<br>`maxTagPlaceholder`<br>`removeIcon`<br>`listOfTopItem`<br>`tokenSeparators`<br>`prefix` | `tokenize`<br>`inputValueChange`<br>`deleteItem` |

## skeleton

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-skeleton` | `NzSkeletonComponent` | Component | `nzActive`<br>`nzLoading`<br>`nzRound`<br>`nzTitle`<br>`nzAvatar`<br>`nzParagraph` | - |
| `nz-skeleton-element[nzType="avatar"]` | `NzSkeletonElementAvatarComponent` | Component | `nzShape`<br>`nzSize` | - |
| `nz-skeleton-element[nzType="button"]` | `NzSkeletonElementButtonComponent` | Component | `nzShape`<br>`nzSize` | - |
| `nz-skeleton-element` | `NzSkeletonElementDirective` | Directive | `nzActive`<br>`nzType`<br>`nzBlock` | - |
| `nz-skeleton-element[nzType="image"]` | `NzSkeletonElementImageComponent` | Component | - | - |
| `nz-skeleton-element[nzType="input"]` | `NzSkeletonElementInputComponent` | Component | `nzSize` | - |

## slider

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-slider` | `NzSliderComponent` | Component | `nzDisabled`<br>`nzDots`<br>`nzIncluded`<br>`nzRange`<br>`nzVertical`<br>`nzReverse`<br>`nzDefaultValue`<br>`nzMarks`<br>`nzMax`<br>`nzMin`<br>`nzStep`<br>`nzTooltipVisible`<br>`nzTooltipPlacement`<br>`nzTipFormatter` | `nzOnAfterChange` |

## space

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-space-compact` | `NzSpaceCompactComponent` | Component | `nzBlock`<br>`nzDirection`<br>`nzSize` | - |
| `nz-space, [nz-space]` | `NzSpaceComponent` | Component | `nzDirection`<br>`nzAlign`<br>`nzSplit`<br>`nzWrap`<br>`nzSize` | - |
| `[nzSpaceItem]` | `NzSpaceItemDirective` | Directive | - | - |

## spin

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-spin` | `NzSpinComponent` | Component | `nzIndicator`<br>`nzSize`<br>`nzTip`<br>`nzDelay`<br>`nzSimple`<br>`nzSpinning` | - |

## splitter

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-splitter` | `NzSplitterComponent` | Component | `nzLayout`<br>`nzLazy` | `nzResizeStart`<br>`nzResize`<br>`nzResizeEnd` |
| `nz-splitter-panel` | `NzSplitterPanelComponent` | Component | `nzDefaultSize`<br>`nzMin`<br>`nzMax`<br>`nzSize`<br>`nzCollapsible`<br>`nzResizable` | - |

## statistic

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-countdown` | `NzCountdownComponent` | Component | `nzFormat` | `nzCountdownFinish` |
| `nz-statistic` | `NzStatisticComponent` | Component | `nzPrefix`<br>`nzSuffix`<br>`nzTitle`<br>`nzValue`<br>`nzValueStyle`<br>`nzValueTemplate`<br>`nzLoading` | - |
| `nz-statistic-content-value` | `NzStatisticContentValueComponent` | Component | `nzValue`<br>`nzValueTemplate` | - |

## steps

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-step` | `NzStepComponent` | Component | `nzTitle`<br>`nzSubtitle`<br>`nzDescription`<br>`nzDisabled`<br>`nzPercentage`<br>`nzSize`<br>`nzStatus`<br>`nzIcon` | - |
| `nz-steps` | `NzStepsComponent` | Component | `nzCurrent`<br>`nzDirection`<br>`nzLabelPlacement`<br>`nzType`<br>`nzSize`<br>`nzStartIndex`<br>`nzStatus`<br>`nzProgressDot` | `nzIndexChange` |

## switch

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-switch` | `NzSwitchComponent` | Component | `nzLoading`<br>`nzDisabled`<br>`nzControl`<br>`nzCheckedChildren`<br>`nzUnCheckedChildren`<br>`nzSize`<br>`nzId` | - |

## table

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `th[nzAlign],td[nzAlign]` | `NzCellAlignDirective` | Directive | `nzAlign` | - |
| `th[nzBreakWord],td[nzBreakWord]` | `NzCellBreakWordDirective` | Directive | `nzBreakWord` | - |
| `th[nzEllipsis],td[nzEllipsis]` | `NzCellEllipsisDirective` | Directive | `nzEllipsis` | - |
| `td[nzRight],th[nzRight],td[nzLeft],th[nzLeft]` | `NzCellFixedDirective` | Directive | `nzRight`<br>`nzLeft`<br>`colspan`<br>`colSpan` | - |
| `td[nzCellControl],th[nzCellControl]` | `NzCustomColumnDirective` | Directive | `nzCellControl` | - |
| `nz-filter-trigger` | `NzFilterTriggerComponent` | Component | `nzActive`<br>`nzDropdownMenu`<br>`nzVisible`<br>`nzBackdrop` | `nzVisibleChange` |
| `button[nz-row-expand-button]` | `NzRowExpandButtonDirective` | Directive | `expand`<br>`spaceMode` | `expandChange` |
| `nz-row-indent` | `NzRowIndentDirective` | Directive | `indentSize` | - |
| `th:not(.nz-disable-th), td:not(.nz-disable-td)` | `NzTableCellDirective` | Directive | - | - |
| `nz-table` | `NzTableComponent` | Component | `nzTableLayout`<br>`nzShowTotal`<br>`nzItemRender`<br>`nzTitle`<br>`nzFooter`<br>`nzNoResult`<br>`nzPageSizeOptions`<br>`nzVirtualItemSize`<br>`nzVirtualMaxBufferPx`<br>`nzVirtualMinBufferPx`<br>`nzVirtualForTrackBy`<br>`nzLoadingDelay`<br>`nzPageIndex`<br>`nzPageSize`<br>`nzTotal`<br>`nzWidthConfig`<br>`nzData`<br>`nzCustomColumn`<br>`nzPaginationPosition`<br>`nzScroll`<br>`noDataVirtualHeight`<br>`nzPaginationType`<br>`nzFrontPagination`<br>`nzTemplateMode`<br>`nzShowPagination`<br>`nzLoading`<br>`nzOuterBordered`<br>`nzLoadingIndicator`<br>`nzBordered`<br>`nzSize`<br>`nzShowSizeChanger`<br>`nzHideOnSinglePage`<br>`nzShowQuickJumper`<br>`nzSimple` | `nzPageSizeChange`<br>`nzPageIndexChange`<br>`nzQueryParams`<br>`nzCurrentPageDataChange`<br>`nzCustomColumnChange` |
| `table[nz-table-content]` | `NzTableContentComponent` | Component | `tableLayout`<br>`theadTemplate`<br>`contentTemplate`<br>`tfootTemplate`<br>`listOfColWidth`<br>`scrollX` | - |
| `nz-table-filter` | `NzTableFilterComponent` | Component | `contentTemplate`<br>`customFilter`<br>`extraTemplate`<br>`filterMultiple`<br>`listOfFilter` | `filterChange` |
| `tr[nz-table-fixed-row], tr[nzExpand]` | `NzTableFixedRowComponent` | Component | - | - |
| `nz-table-inner-default` | `NzTableInnerDefaultComponent` | Component | `tableLayout`<br>`listOfColWidth`<br>`theadTemplate`<br>`contentTemplate`<br>`tfootTemplate` | - |
| `nz-table-inner-scroll` | `NzTableInnerScrollComponent` | Component | `data`<br>`scrollX`<br>`scrollY`<br>`contentTemplate`<br>`widthConfig`<br>`listOfColWidth`<br>`theadTemplate`<br>`tfootTemplate`<br>`tfootFixed`<br>`virtualTemplate`<br>`virtualItemSize`<br>`virtualMaxBufferPx`<br>`virtualMinBufferPx`<br>`tableMainElement`<br>`virtualForTrackBy`<br>`verticalScrollBarWidth`<br>`noDataVirtualHeight` | - |
| `nz-table-selection` | `NzTableSelectionComponent` | Component | `listOfSelections`<br>`checked`<br>`disabled`<br>`indeterminate`<br>`label`<br>`showCheckbox`<br>`showRowSelection` | `checkedChange` |
| `nz-table-sorters` | `NzTableSortersComponent` | Component | `sortDirections`<br>`sortOrder`<br>`contentTemplate` | - |
| `nz-table-title-footer` | `NzTableTitleFooterComponent` | Component | `title`<br>`footer` | - |
| `[nz-virtual-scroll]` | `NzTableVirtualScrollDirective` | Directive | - | - |
| `tbody` | `NzTbodyComponent` | Component | - | - |
| `td[nzChecked], td[nzDisabled], td[nzIndeterminate], td[nzIndentSize], td[nzExpand], td[nzShowExpand], td[nzShowCheckbox]` | `NzTdAddOnComponent` | Component | `nzChecked`<br>`nzDisabled`<br>`nzIndeterminate`<br>`nzLabel`<br>`nzIndentSize`<br>`nzShowExpand`<br>`nzShowCheckbox`<br>`nzExpand`<br>`nzExpandIcon` | `nzCheckedChange`<br>`nzExpandChange` |
| `tfoot[nzSummary]` | `NzTfootSummaryComponent` | Component | `nzFixed` | - |
| `th[nzColumnKey], th[nzSortFn], th[nzSortOrder], th[nzFilters], th[nzShowSort], th[nzShowFilter], th[nzCustomFilter]` | `NzThAddOnComponent` | Component | `nzColumnKey`<br>`nzFilterMultiple`<br>`nzSortOrder`<br>`nzSortPriority`<br>`nzSortDirections`<br>`nzFilters`<br>`nzSortFn`<br>`nzFilterFn`<br>`nzShowSort`<br>`nzShowFilter`<br>`nzCustomFilter` | `nzCheckedChange`<br>`nzSortOrderChange`<br>`nzFilterChange` |
| `thead:not(.ant-table-thead)` | `NzTheadComponent` | Component | - | `nzSortOrderChange` |
| `th` | `NzThMeasureDirective` | Directive | `nzWidth`<br>`colspan`<br>`colSpan`<br>`rowspan`<br>`rowSpan` | - |
| `th[nzSelections],th[nzChecked],th[nzShowCheckbox],th[nzShowRowSelection]` | `NzThSelectionComponent` | Component | `nzSelections`<br>`nzChecked`<br>`nzDisabled`<br>`nzIndeterminate`<br>`nzLabel`<br>`nzShowCheckbox`<br>`nzShowRowSelection` | `nzCheckedChange` |
| `tr:not([nz-table-measure-row]):not([nzExpand]):not([nz-table-fixed-row])` | `NzTrDirective` | Directive | - | - |
| `tr[nzExpand]` | `NzTrExpandDirective` | Directive | `nzExpand` | - |
| `tr[nz-table-measure-row]` | `NzTrMeasureComponent` | Component | `listOfMeasureColumn` | `listOfAutoWidth` |

## tabs

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nzTabBarExtraContent]:not(nz-tabs)` | `NzTabBarExtraContentDirective` | Directive | `position as nzTabBarExtraContent` | - |
| `nz-tab` | `NzTabComponent` | Component | `nzTitle`<br>`nzClosable`<br>`nzCloseIcon`<br>`nzDisabled`<br>`nzForceRender` | `nzSelect`<br>`nzDeselect`<br>`nzClick`<br>`nzContextmenu` |
| `[nz-tab]` | `NzTabDirective` | Directive | - | - |
| `a[nz-tab-link]` | `NzTabLinkDirective` | Directive | - | - |
| `ng-template[nzTabLink]` | `NzTabLinkTemplateDirective` | Directive | - | - |
| `nz-tabs` | `NzTabsComponent` | Component | `nzSelectedIndex`<br>`nzTabPosition`<br>`nzTabBarExtraContent`<br>`nzCanDeactivate`<br>`nzAddIcon`<br>`nzTabBarStyle`<br>`nzType`<br>`nzSize`<br>`nzAnimated`<br>`nzTabBarGutter`<br>`nzHideAdd`<br>`nzCentered`<br>`nzHideAll`<br>`nzLinkRouter`<br>`nzLinkExact`<br>`nzDestroyInactiveTabPane`<br>`nzIndicator` | `nzSelectChange`<br>`nzSelectedIndexChange`<br>`nzTabListScroll`<br>`nzClose`<br>`nzAdd` |

## tag

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-tag` | `NzTagComponent` | Component | `nzMode`<br>`nzColor`<br>`nzChecked`<br>`nzBordered` | `nzOnClose`<br>`nzCheckedChange` |

## time-picker

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-time-picker` | `NzTimePickerComponent` | Component | `nzId`<br>`nzSize`<br>`nzStatus`<br>`nzVariant`<br>`nzHourStep`<br>`nzMinuteStep`<br>`nzSecondStep`<br>`nzClearText`<br>`nzNowText`<br>`nzOkText`<br>`nzPopupClassName`<br>`nzPlaceHolder`<br>`nzAddOn`<br>`nzDefaultOpenValue`<br>`nzDisabledHours`<br>`nzDisabledMinutes`<br>`nzDisabledSeconds`<br>`nzFormat`<br>`nzOpen`<br>`nzUse12Hours`<br>`nzSuffixIcon`<br>`nzHideDisabledOptions`<br>`nzAllowEmpty`<br>`nzDisabled`<br>`nzAutoFocus`<br>`nzBackdrop`<br>`nzInputReadOnly`<br>`nzPrefix`<br>`nzNeedConfirm`<br>`nzPlacement` | `nzOpenChange` |
| `nz-time-picker-panel` | `NzTimePickerPanelComponent` | Component | `nzInDatePicker`<br>`nzAddOn`<br>`nzHideDisabledOptions`<br>`nzClearText`<br>`nzNowText`<br>`nzOkText`<br>`nzPlaceHolder`<br>`nzUse12Hours`<br>`nzDefaultOpenValue`<br>`nzAllowEmpty`<br>`nzDisabledHours`<br>`nzDisabledMinutes`<br>`nzDisabledSeconds`<br>`format`<br>`nzHourStep`<br>`nzMinuteStep`<br>`nzSecondStep` | `closePanel` |

## timeline

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-timeline` | `NzTimelineComponent` | Component | `nzMode`<br>`nzPending`<br>`nzPendingDot`<br>`nzReverse` | - |
| `nz-timeline-item, [nz-timeline-item]` | `NzTimelineItemComponent` | Component | `nzPosition`<br>`nzColor`<br>`nzDot`<br>`nzLabel` | - |

## tooltip

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-tooltip` | `NzTooltipComponent` | Component | - | - |
| `[nz-tooltip]` | `NzTooltipDirective` | Directive | `title as nzTooltipTitle`<br>`titleContext as nzTooltipTitleContext`<br>`directiveTitle as nz-tooltip`<br>`trigger as nzTooltipTrigger`<br>`placement as nzTooltipPlacement`<br>`origin as nzTooltipOrigin`<br>`visible as nzTooltipVisible`<br>`mouseEnterDelay as nzTooltipMouseEnterDelay`<br>`mouseLeaveDelay as nzTooltipMouseLeaveDelay`<br>`overlayClassName as nzTooltipOverlayClassName`<br>`overlayStyle as nzTooltipOverlayStyle`<br>`arrowPointAtCenter as nzTooltipArrowPointAtCenter`<br>`nzTooltipColor` | `visibleChange as nzTooltipVisibleChange` |

## transfer

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-transfer` | `NzTransferComponent` | Component | `nzDisabled`<br>`nzDataSource`<br>`nzTitles`<br>`nzOperations`<br>`nzListStyle`<br>`nzShowSelectAll`<br>`nzItemUnit`<br>`nzItemsUnit`<br>`nzCanMove`<br>`nzRenderList`<br>`nzRender`<br>`nzFooter`<br>`nzShowSearch`<br>`nzFilterOption`<br>`nzSearchPlaceholder`<br>`nzNotFoundContent`<br>`nzTargetKeys`<br>`nzSelectedKeys`<br>`nzStatus`<br>`nzOneWay` | `nzChange`<br>`nzSearchChange`<br>`nzSelectChange` |
| `nz-transfer-list` | `NzTransferListComponent` | Component | `direction`<br>`titleText`<br>`showSelectAll`<br>`dataSource`<br>`itemUnit`<br>`itemsUnit`<br>`filter`<br>`oneWay`<br>`disabled`<br>`showSearch`<br>`searchPlaceholder`<br>`notFoundContent`<br>`filterOption`<br>`renderList`<br>`render`<br>`footer` | `handleSelectAll`<br>`handleSelect`<br>`filterChange`<br>`moveToLeft` |

## tree

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-tree` | `NzTreeComponent` | Component | `nzShowIcon`<br>`nzHideUnMatched`<br>`nzBlockNode`<br>`nzExpandAll`<br>`nzSelectMode`<br>`nzCheckStrictly`<br>`nzShowExpand`<br>`nzShowLine`<br>`nzCheckable`<br>`nzAsyncData`<br>`nzDraggable`<br>`nzMultiple`<br>`nzExpandedIcon`<br>`nzVirtualItemSize`<br>`nzVirtualMaxBufferPx`<br>`nzVirtualMinBufferPx`<br>`nzVirtualHeight`<br>`nzTreeTemplate`<br>`nzBeforeDrop`<br>`nzData`<br>`nzExpandedKeys`<br>`nzSelectedKeys`<br>`nzCheckedKeys`<br>`nzSearchValue`<br>`nzSearchFunc` | `nzExpandedKeysChange`<br>`nzSelectedKeysChange`<br>`nzCheckedKeysChange`<br>`nzSearchValueChange`<br>`nzClick`<br>`nzDblClick`<br>`nzContextMenu`<br>`nzCheckboxChange`<br>`nzExpandChange`<br>`nzOnDragStart`<br>`nzOnDragEnter`<br>`nzOnDragOver`<br>`nzOnDragLeave`<br>`nzOnDrop`<br>`nzOnDragEnd` |
| `nz-tree-indent` | `NzTreeIndentComponent` | Component | `nzTreeLevel`<br>`nzIsStart`<br>`nzIsEnd`<br>`nzSelectMode` | - |
| `nz-tree-node-checkbox[builtin]` | `NzTreeNodeBuiltinCheckboxComponent` | Component | `nzSelectMode`<br>`isChecked`<br>`isHalfChecked`<br>`isDisabled`<br>`isDisableCheckbox` | - |
| `nz-tree-node[builtin]` | `NzTreeNodeBuiltinComponent` | Component | `icon`<br>`title`<br>`isLoading`<br>`isSelected`<br>`isDisabled`<br>`isMatched`<br>`isExpanded`<br>`isLeaf`<br>`isChecked`<br>`isHalfChecked`<br>`isDisableCheckbox`<br>`isSelectable`<br>`canHide`<br>`isStart`<br>`isEnd`<br>`nzTreeNode`<br>`nzShowLine`<br>`nzShowExpand`<br>`nzCheckable`<br>`nzAsyncData`<br>`nzHideUnMatched`<br>`nzNoAnimation`<br>`nzSelectMode`<br>`nzShowIcon`<br>`nzExpandedIcon`<br>`nzTreeTemplate`<br>`nzBeforeDrop`<br>`nzSearchValue`<br>`nzDraggable` | `nzClick`<br>`nzDblClick`<br>`nzContextMenu`<br>`nzCheckboxChange`<br>`nzExpandChange`<br>`nzOnDragStart`<br>`nzOnDragEnter`<br>`nzOnDragOver`<br>`nzOnDragLeave`<br>`nzOnDrop`<br>`nzOnDragEnd` |
| `nz-tree-node-switcher` | `NzTreeNodeSwitcherComponent` | Component | `nzShowExpand`<br>`nzShowLine`<br>`nzExpandedIcon`<br>`nzSelectMode`<br>`context`<br>`isLeaf`<br>`isLoading`<br>`isExpanded` | - |
| `nz-tree-node-title` | `NzTreeNodeTitleComponent` | Component | `searchValue`<br>`treeTemplate`<br>`draggable`<br>`showIcon`<br>`selectMode`<br>`context`<br>`icon`<br>`title`<br>`isLoading`<br>`isSelected`<br>`isDisabled`<br>`isMatched`<br>`isExpanded`<br>`isLeaf`<br>`showIndicator`<br>`dragPosition` | - |

## tree-select

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-tree-select` | `NzTreeSelectComponent` | Component | `nzId`<br>`nzAllowClear`<br>`nzShowExpand`<br>`nzShowLine`<br>`nzDropdownMatchSelectWidth`<br>`nzCheckable`<br>`nzHideUnMatched`<br>`nzShowIcon`<br>`nzShowSearch`<br>`nzDisabled`<br>`nzAsyncData`<br>`nzMultiple`<br>`nzDefaultExpandAll`<br>`nzCheckStrictly`<br>`nzVirtualItemSize`<br>`nzVirtualMaxBufferPx`<br>`nzVirtualMinBufferPx`<br>`nzVirtualHeight`<br>`nzExpandedIcon`<br>`nzNotFoundContent`<br>`nzNodes`<br>`nzOpen`<br>`nzSize`<br>`nzVariant`<br>`nzPlaceHolder`<br>`nzDropdownStyle`<br>`nzDropdownClassName`<br>`nzBackdrop`<br>`nzStatus`<br>`nzPlacement`<br>`nzExpandedKeys`<br>`nzPrefix`<br>`nzSuffixIcon`<br>`nzDisplayWith`<br>`nzMaxTagCount`<br>`nzMaxTagPlaceholder`<br>`nzTreeTemplate` | `nzOpenChange`<br>`nzCleared`<br>`nzRemoved`<br>`nzExpandChange`<br>`nzTreeClick`<br>`nzTreeCheckboxChange` |

## tree-view

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-tree-node-checkbox:not([builtin])` | `NzTreeNodeCheckboxComponent` | Component | `nzChecked`<br>`nzIndeterminate`<br>`nzDisabled` | `nzClick` |
| `nz-tree-node:not([builtin])` | `NzTreeNodeComponent` | Component | `isExpandable as nzExpandable` | - |
| `[nzTreeNodeDef]` | `NzTreeNodeDefDirective` | Directive | `when as nzTreeNodeDefWhen` | - |
| `nz-tree-node[nzTreeNodeIndentLine]` | `NzTreeNodeIndentLineDirective` | Directive | - | - |
| `nz-tree-node-indents` | `NzTreeNodeIndentsComponent` | Component | `indents` | - |
| `nz-tree-node-toggle[nzTreeNodeNoopToggle], [nzTreeNodeNoopToggle]` | `NzTreeNodeNoopToggleDirective` | Directive | - | - |
| `nz-tree-node-option` | `NzTreeNodeOptionComponent` | Component | `nzSelected`<br>`nzDisabled` | `nzClick` |
| `[nzTreeNodeOutlet]` | `NzTreeNodeOutletDirective` | Directive | - | - |
| `[nzTreeNodePadding]` | `NzTreeNodePaddingDirective` | Directive | `level as nzTreeNodePadding`<br>`indent as nzTreeNodePaddingIndent` | - |
| `[nzTreeNodeToggleActiveIcon]` | `NzTreeNodeToggleActiveIconDirective` | Directive | - | - |
| `nz-tree-node-toggle:not([nzTreeNodeNoopToggle]), [nzTreeNodeToggle]` | `NzTreeNodeToggleDirective` | Directive | `recursive as nzTreeNodeToggleRecursive` | - |
| `[nzTreeNodeToggleRotateIcon]` | `NzTreeNodeToggleRotateIconDirective` | Directive | - | - |
| `ng-component` | `NzTreeView` | Component | `levelAccessor as nzLevelAccessor`<br>`childrenAccessor as nzChildrenAccessor`<br>`dataSource as nzDataSource`<br>`trackBy as nzTrackBy`<br>`nzDirectoryTree`<br>`nzBlockNode` | - |
| `nz-tree-view` | `NzTreeViewComponent` | Component | - | - |
| `[nzTreeVirtualScrollNodeOutlet]` | `NzTreeVirtualScrollNodeOutletDirective` | Directive | `data`<br>`compareBy` | - |
| `nz-tree-virtual-scroll-view` | `NzTreeVirtualScrollViewComponent` | Component | `nzItemSize`<br>`nzMinBufferPx`<br>`nzMaxBufferPx` | - |

## typography

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `nz-text-copy` | `NzTextCopyComponent` | Component | `text`<br>`tooltips`<br>`icons` | `textCopy` |
| `nz-text-edit` | `NzTextEditComponent` | Component | `text`<br>`icon`<br>`tooltip` | `startEditing`<br>`endEditing` |
| `nz-typography, [nz-typography], p[nz-paragraph], span[nz-text], h1[nz-title], h2[nz-title], h3[nz-title], h4[nz-title]` | `NzTypographyComponent` | Component | `nzCopyable`<br>`nzEditable`<br>`nzDisabled`<br>`nzExpandable`<br>`nzEllipsis`<br>`nzCopyTooltips`<br>`nzCopyIcons`<br>`nzEditTooltip`<br>`nzEditIcon`<br>`nzContent`<br>`nzEllipsisRows`<br>`nzType`<br>`nzCopyText`<br>`nzSuffix` | `nzContentChange`<br>`nzCopy`<br>`nzExpandChange`<br>`nzOnEllipsis` |

## upload

| Selector | Class | 类型 | Inputs | Outputs |
| --- | --- | --- | --- | --- |
| `[nz-upload-btn]` | `NzUploadBtnComponent` | Component | `nzId`<br>`options` | - |
| `nz-upload` | `NzUploadComponent` | Component | `nzId`<br>`nzType`<br>`nzLimit`<br>`nzSize`<br>`nzFileType`<br>`nzAccept`<br>`nzAction`<br>`nzDirectory`<br>`nzOpenFileDialogOnClick`<br>`nzBeforeUpload`<br>`nzCustomRequest`<br>`nzData`<br>`nzFilter`<br>`nzFileList`<br>`nzDisabled`<br>`nzHeaders`<br>`nzListType`<br>`nzMultiple`<br>`nzName`<br>`nzShowUploadList`<br>`nzShowButton`<br>`nzWithCredentials`<br>`nzRemove`<br>`nzPreview`<br>`nzPreviewFile`<br>`nzPreviewIsImage`<br>`nzDownload`<br>`nzIconRender`<br>`nzFileListRender`<br>`nzMaxCount` | `nzChange`<br>`nzFileListChange` |
| `nz-upload-list` | `NzUploadListComponent` | Component | `listType`<br>`locale`<br>`items`<br>`icons`<br>`onPreview`<br>`onRemove`<br>`onDownload`<br>`previewFile`<br>`previewIsImage`<br>`iconRender` | - |

---

## 服务速查

`NzMessageService`（`ng-zorro-antd/message`）、`NzNotificationService`（`ng-zorro-antd/notification`）、`NzModalService`（`ng-zorro-antd/modal`）、`NzDrawerService`（`ng-zorro-antd/drawer`）等为服务式调用，需在组件中注入；服务本身不在组件索引里，完整方法以官方文档为准。

## 维护

```bash
# 升级 ng-zorro-antd 后重新生成：解包 npm 包的 types/*.d.ts，解析 ɵɵComponentDeclaration / ɵɵDirectiveDeclaration
```