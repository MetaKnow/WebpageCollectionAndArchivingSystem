/* ==========================================================================
   登录页脚本（PROTOTYPE — 非生产实现）
   仅做前端校验与角色映射：不发送请求、不校验密码、不产生真实登录。
   ========================================================================== */
(function () {
  "use strict";

  var WCR = window.WCR;
  var form = document.getElementById("loginForm");
  if (!form || !WCR) return;

  var usernameInput = document.getElementById("username");
  var passwordInput = document.getElementById("password");
  var usernameField = document.getElementById("usernameField");
  var passwordField = document.getElementById("passwordField");
  var usernameError = document.getElementById("usernameError");
  var passwordError = document.getElementById("passwordError");
  var hint = document.getElementById("loginHint");
  var hintText = document.getElementById("loginHintText");
  var submitBtn = document.getElementById("loginSubmit");
  var submitText = document.getElementById("loginSubmitText");
  var spinner = document.getElementById("loginSpinner");
  var toggleBtn = document.getElementById("togglePassword");
  var passwordIcon = document.getElementById("passwordIcon");
  var remember = document.getElementById("remember");
  var forgotLink = document.getElementById("forgotLink");
  var toastStack = document.getElementById("toastStack");

  var REMEMBER_KEY = "wcr.rememberedUser";

  /* ---------- 轻量 toast ---------- */
  function toast(message, type) {
    if (!toastStack) return;
    var el = document.createElement("div");
    el.className = "toast" + (type ? " toast--" + type : "");
    el.setAttribute("role", "status");
    el.innerHTML =
      '<svg class="icon" aria-hidden="true"><use href="#icon-' +
      (type === "warning" ? "alert-triangle" : "info") +
      '"/></svg><span></span>';
    el.lastChild.textContent = message;
    toastStack.appendChild(el);
    window.setTimeout(function () {
      el.remove();
    }, 3200);
  }

  /* ---------- 记住用户名（localStorage 仅存用户名） ---------- */
  try {
    var remembered = window.localStorage.getItem(REMEMBER_KEY);
    if (remembered) {
      usernameInput.value = remembered;
      remember.checked = true;
      passwordInput.focus();
    }
  } catch (e) {
    /* 隐私模式忽略 */
  }

  /* ---------- 密码可见性 ---------- */
  toggleBtn.addEventListener("click", function () {
    var show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    toggleBtn.setAttribute("aria-pressed", String(show));
    toggleBtn.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
    passwordIcon.setAttribute("href", show ? "#icon-eye-off" : "#icon-eye");
    passwordInput.focus();
  });

  /* ---------- 错误状态 ---------- */
  function setFieldError(field, errorEl, message) {
    field.classList.toggle("field--error", Boolean(message));
    errorEl.hidden = !message;
    if (message) errorEl.lastChild.textContent = " " + message;
    var input = field.querySelector("input");
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function showHint(message) {
    hintText.textContent = message;
    hint.hidden = false;
  }

  function clearHint() {
    hint.hidden = true;
  }

  function clearErrors() {
    setFieldError(usernameField, usernameError, "");
    setFieldError(passwordField, passwordError, "");
    clearHint();
  }

  usernameInput.addEventListener("input", clearErrors);
  passwordInput.addEventListener("input", clearErrors);

  /* ---------- 演示账号一键填入 ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll(".demo-account"),
    function (btn) {
      btn.addEventListener("click", function () {
        usernameInput.value = btn.getAttribute("data-account");
        passwordInput.value = btn.getAttribute("data-password");
        clearErrors();
        toast("已填入演示账号，点击“登录”进入工作台。", "info");
        submitBtn.focus();
      });
    }
  );

  /* ---------- 忘记密码：原型无该流程，明确说明 ---------- */
  forgotLink.addEventListener("click", function (event) {
    event.preventDefault();
    toast("原型未实现找回密码流程，请联系档案馆系统管理员重置。", "warning");
  });

  /* ---------- 提交 ---------- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    var username = usernameInput.value.trim();
    var password = passwordInput.value;
    var roleId = WCR.ACCOUNTS[username.toLowerCase()];
    var valid = true;

    if (!username) {
      setFieldError(usernameField, usernameError, "请输入用户名");
      valid = false;
    } else if (!roleId) {
      setFieldError(usernameField, usernameError, "未找到该账号");
      valid = false;
    }

    if (!password) {
      setFieldError(passwordField, passwordError, "请输入密码");
      valid = false;
    }

    if (!valid) {
      if (!username) {
        usernameInput.focus();
      } else if (!roleId) {
        showHint(
          "该用户名不在原型演示账号中，请点击下方任一演示账号填入后再登录。"
        );
        usernameInput.focus();
      } else {
        passwordInput.focus();
      }
      return;
    }

    /* 演示口令仅用于提示，原型不校验密码 */
    if (remember.checked) {
      try {
        window.localStorage.setItem(REMEMBER_KEY, username);
      } catch (e) {
        /* ignore */
      }
    } else {
      try {
        window.localStorage.removeItem(REMEMBER_KEY);
      } catch (e) {
        /* ignore */
      }
    }

    submitBtn.classList.add("is-loading");
    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.disabled = true;
    spinner.hidden = false;
    submitText.textContent = "正在进入…";

    window.setTimeout(function () {
      var session = WCR.session.forRole(roleId, username);
      session.account = username;
      WCR.session.write(session);
      window.location.href = "workbench.html#/workbench";
    }, 450);
  });
})();
