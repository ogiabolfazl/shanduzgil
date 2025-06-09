// **هشدار: قرار دادن API Key به این شکل اصلا امن نیست و در محیط واقعی نباید استفاده شود.**
// این روش فقط برای سادگی تست و طبق درخواست شما استفاده شده است.
const OPENAI_API_KEY = "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";

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const signupContainer = document.getElementById('signupContainer');
const chatContainer = document.getElementById('chatContainer');
const goToChatButton = document.getElementById('goToChatButton');
const captchaImage = document.getElementById('captchaImage');

let isSignedUp = false; // وضعیت ثبت نام

// تابع برای نمایش کپچا
function generateCaptcha() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    captchaImage.textContent = captcha;
    return captcha;
}

let currentCaptcha = generateCaptcha(); // مقدار کپچا

// تابع برای بررسی صحت کپچا
function validateCaptcha(input) {
    return input === currentCaptcha;
}

// تابع برای ثبت نام
function signup() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const captchaInput = document.getElementById('captcha').value.trim();
    const terms = document.getElementById('terms').checked;

    if (!firstName || !lastName || !phoneNumber || !captchaInput || !terms) {
        alert('لطفا تمام فیلدها را پر کنید و شرایط و قوانین را بپذیرید.');
        return;
    }

    if (!validateCaptcha(captchaInput)) {
        alert('کپچا اشتباه است. لطفا دوباره تلاش کنید.');
        currentCaptcha = generateCaptcha(); // تولید کپچای جدید
        return;
    }

    // انجام عملیات ثبت نام (مثلا ارسال اطلاعات به سرور)
    console.log('ثبت نام با موفقیت انجام شد!');
    alert('ثبت نام با موفقیت انجام شد!');

    // تغییر وضعیت ثبت نام و نمایش دکمه ورود به چت
    isSignedUp = true;
    signupContainer.style.display = 'none';
    goToChatButton.style.display = 'block';
}

// تابع برای رفتن به صفحه چت
function goToChat() {
    if (isSignedUp) {
        signupContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        goToChatButton.style.display = 'none';
    } else {
        alert('لطفا ابتدا ثبت نام کنید.');
    }
}

/**
 * تابعی برای اضافه کردن پیام به پنجره چت
 * @param {string} text - متن پیام
 * @param {'user'|'ai'} sender - فرستنده پیام (user یا ai)
 * @param {boolean} isNew - آیا پیام تازه اضافه شده است؟ (برای اعمال انیمیشن)
 * @returns {HTMLElement} المان پیام ایجاد شده
 */
function addMessage(text, sender, isNew = true) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    if (isNew) {
        messageDiv.classList.add('new');
    }

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = text;
    messageDiv.appendChild(messageParagraph);

    const metaDiv = document.createElement('div');
    metaDiv.classList.add('message-meta');
    metaDiv.textContent = sender === 'ai' ? 'شاندوز - هوش مصنوعی' : 'شما';
    messageDiv.appendChild(metaDiv);

    chatMessages.appendChild(messageDiv);
    // اسکرول به پایین برای دیدن جدیدترین پیام
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv; // برای استفاده‌های بعدی (مثل حذف پیام لودینگ)
}

/**
 * تابعی برای ارسال درخواست به OpenAI و مدیریت پاسخ
 */
async function sendRequest() {
    const input = userInput.value.trim();

    if (!input) {
        return; // اگر ورودی خالی بود، کاری نکن
    }

    // اضافه کردن پیام کاربر به چت و پاک کردن ورودی
    addMessage(input, 'user');
    userInput.value = '';

    // اضافه کردن پیام "در حال پردازش..." از طرف AI
    const loadingMessageDiv = addMessage('در حال پردازش...', 'ai');
    loadingMessageDiv.classList.add('loading-message'); // کلاس برای انیمیشن پالس

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // مدل مورد استفاده
                messages: [{ role: "user", content: input }],
                max_tokens: 150,
                temperature: 0.7 // می‌تواند برای کنترل خلاقیت پاسخ تنظیم شود
            })
        });

        const data = await response.json();

        // حذف پیام "در حال پردازش..."
        loadingMessageDiv.remove();

        let aiResponseText;
        if (data.choices && data.choices.length > 0) {
            aiResponseText = data.choices[0].message.content.trim();
        } else if (data.error) {
            aiResponseText = `خطا از API: ${data.error.message}`;
            console.error("OpenAI API Error:", data.error);
        } else {
            aiResponseText = 'پاسخی از سرور دریافت نشد.';
        }

        addMessage(aiResponseText, 'ai');

    } catch (error) {
        // حذف پیام "در حال پردازش..." در صورت خطا
        loadingMessageDiv.remove();
        addMessage(`خطای شبکه یا سرور: ${error.message}`, 'ai');
        console.error("Network or Server Error:", error);
    }
}

// گوش دادن به رویداد 'keypress' برای ارسال پیام با Enter
userInput.addEventListener('keypress', (e) => {
    // اگر کلید Enter فشرده شد و کلید Shift فشرده نشده بود
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // جلوگیری از ایجاد خط جدید در textarea
        sendRequest();
    }
});

// نمایش کپچا در ابتدا
generateCaptcha();
