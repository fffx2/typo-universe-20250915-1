// DOM이 로드되면 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// 전역 상태 관리 객체
let appState = {
    service: '',       // 선택된 서비스 목적
    platform: '',      // 선택된 플랫폼
    mood: { soft: 50, static: 50 },  // 무드 슬라이더 값
    keyword: '',       // 선택된 키워드
    primaryColor: '',  // 선택된 주조 색상
    generatedPalette: null  // 생성된 컬러 팔레트
};

// Knowledge Base 데이터 저장 변수
let knowledgeBase = {};
// 타이핑 효과를 위한 변수
let typingTimeout;

// ==================== 초기화 함수 ====================
async function initializeApp() {
    try {
        // knowledge_base.json 파일 로드
        const response = await fetch('knowledge_base.json');
        knowledgeBase = await response.json();
        
        // 드롭다운 메뉴 초기화
        initializeDropdowns();
        
        // 무드 슬라이더 초기화
        initializeSliders();
        
        // 실험실 페이지 초기화
        initializeLabPage();
        
        // 초기 AI 메시지 설정 (타이핑 효과 적용)
        updateAIMessage("안녕하세요! TYPOUNIVERSE AI Design Assistant입니다. 어떤 프로젝트를 위한 디자인 가이드를 찾으시나요? 먼저 서비스의 목적과 타겟 플랫폼을 알려주세요.");
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        updateAIMessage("시스템 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.");
    }
}

// ==================== 드롭다운 초기화 ====================
function initializeDropdowns() {
    // 서비스 목적과 플랫폼 옵션 정의
    const services = ['포트폴리오', '브랜드 홍보', '제품 판매', '정보 전달', '학습', '엔터테인먼트'];
    const platforms = ['iOS', 'Android', 'Web', 'Desktop', 'Tablet', 'Wearable', 'VR'];
    
    const serviceMenu = document.getElementById('service-menu');
    const platformMenu = document.getElementById('platform-menu');
    
    // 서비스 목적 드롭다운 메뉴 생성
    services.forEach(service => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.textContent = service;
        option.onclick = () => selectOption('service', service);
        serviceMenu.appendChild(option);
    });
    
    // 플랫폼 드롭다운 메뉴 생성
    platforms.forEach(platform => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.textContent = platform;
        option.onclick = () => selectOption('platform', platform);
        platformMenu.appendChild(option);
    });
}

// ==================== 슬라이더 초기화 ====================
function initializeSliders() {
    const softHardSlider = document.getElementById('soft-hard-slider');
    const staticDynamicSlider = document.getElementById('static-dynamic-slider');
    
    // 슬라이더 변경 이벤트 리스너 추가
    softHardSlider.addEventListener('input', updateMood);
    staticDynamicSlider.addEventListener('input', updateMood);
}

// ==================== 실험실 페이지 초기화 ====================
function initializeLabPage() {
    // 색상 입력 요소들 가져오기
    const bgColorInput = document.getElementById('bg-color-input');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const textColorInput = document.getElementById('text-color-input');
    const textColorPicker = document.getElementById('text-color-picker');
    const lineHeightInput = document.getElementById('line-height-input');
    
    // 배경색 변경 이벤트
    bgColorInput.addEventListener('change', updateContrast);
    bgColorPicker.addEventListener('change', () => {
        bgColorInput.value = bgColorPicker.value;
        updateContrast();
    });
    
    // 텍스트색 변경 이벤트
    textColorInput.addEventListener('change', updateContrast);
    textColorPicker.addEventListener('change', () => {
        textColorInput.value = textColorPicker.value;
        updateContrast();
    });
    
    // 행간 변경 이벤트
    lineHeightInput.addEventListener('input', () => {
        updateLineHeight(lineHeightInput.value);
    });
}

// ==================== STEP 01: 드롭다운 기능 ====================
// 드롭다운 토글 (열기/닫기)
function toggleDropdown(type) {
    const menu = document.getElementById(`${type}-menu`);
    const otherMenu = type === 'service' ? document.getElementById('platform-menu') : document.getElementById('service-menu');
    
    // 다른 드롭다운은 닫고 현재 드롭다운만 토글
    otherMenu.classList.remove('show');
    menu.classList.toggle('show');
}

// 드롭다운 옵션 선택 처리
function selectOption(type, value) {
    const textElement = document.getElementById(`${type}-text`);
    const dropdownElement = document.getElementById(`${type}-dropdown`);
    const menu = document.getElementById(`${type}-menu`);
    
    // 선택된 값 표시 및 스타일 업데이트
    textElement.textContent = value;
    dropdownElement.classList.add('selected');
    menu.classList.remove('show');
    
    // 전역 상태 업데이트
    if (type === 'service') {
        appState.service = value;
    } else {
        appState.platform = value;
    }
    
    // STEP 01 완료 확인
    checkStep1Complete();
}

// STEP 01 완료 여부 확인 및 STEP 02 활성화
function checkStep1Complete() {
    if (appState.service && appState.platform) {
        // 서비스와 플랫폼 모두 선택되면 STEP 02 표시
        document.getElementById('step02').classList.remove('hidden');
        updateAIMessage("훌륭한 선택입니다! 이제 서비스의 핵심 분위기를 정해볼까요? 두 개의 슬라이더를 조절하여 원하는 무드를 찾아주세요.");
    }
}

// ==================== STEP 02: 무드 선택 ====================
// 무드 슬라이더 값 업데이트
function updateMood() {
    const softHard = document.getElementById('soft-hard-slider').value;
    const staticDynamic = document.getElementById('static-dynamic-slider').value;
    
    // 전역 상태에 무드 값 저장
    appState.mood.soft = parseInt(softHard);
    appState.mood.static = parseInt(staticDynamic);
    
    // 슬라이더가 중앙에서 일정 거리 이상 벗어나면 STEP 03 활성화
    if (Math.abs(softHard - 50) > 10 || Math.abs(staticDynamic - 50) > 10) {
        document.getElementById('step03').classList.remove('hidden');
        renderKeywords();
    }
}

// ==================== STEP 03: 키워드 선택 ====================
// 무드에 따른 키워드 렌더링
function renderKeywords() {
    const soft = appState.mood.soft;
    const staticMood = appState.mood.static;
    
    // 무드 값에 따라 그룹 결정
    let group = '';
    if (soft < 40 && staticMood >= 60) {
        group = 'group1'; // Soft + Dynamic (부드럽고 동적인)
    } else if (soft < 40 && staticMood < 40) {
        group = 'group2'; // Soft + Static (부드럽고 정적인)
    } else if (soft >= 60 && staticMood < 40) {
        group = 'group3'; // Hard + Static (딱딱하고 정적인)
    } else if (soft >= 60 && staticMood >= 60) {
        group = 'group4'; // Hard + Dynamic (딱딱하고 동적인)
    } else {
        group = 'group5'; // Neutral (중립적인)
    }
    
    // 선택된 그룹의 키워드 가져오기
    const keywords = knowledgeBase.iri_colors[group].keywords;
    const keywordContainer = document.getElementById('keyword-tags');
    keywordContainer.innerHTML = '';
    
    // 키워드 버튼 생성
    keywords.forEach(keyword => {
        const tag = document.createElement('div');
        tag.className = 'tag tag-light';
        tag.textContent = keyword;
        tag.onclick = () => selectKeyword(keyword, group);
        keywordContainer.appendChild(tag);
    });
    
    // AI 메시지 업데이트
    const moodText = soft < 40 ? 'Soft' : soft >= 60 ? 'Hard' : 'Neutral';
    const dynamicText = staticMood < 40 ? 'Static' : staticMood >= 60 ? 'Dynamic' : 'Neutral';
    updateAIMessage(`선택하신 '${moodText} & ${dynamicText}' 분위기에 맞는 키워드들을 확인해 보세요.`);
}

// 키워드 선택 처리
function selectKeyword(keyword, group) {
    appState.keyword = keyword;
    
    // 선택된 키워드 스타일 업데이트
    const tags = document.querySelectorAll('.tag');
    tags.forEach(tag => {
        if (tag.textContent === keyword) {
            tag.classList.remove('tag-light');
            tag.classList.add('tag-purple', 'selected');
        } else {
            tag.classList.remove('tag-purple', 'selected');
            tag.classList.add('tag-light');
        }
    });
    
    // 해당 그룹의 색상 팔레트 표시
    const colors = knowledgeBase.iri_colors[group].key_colors;
    const colorWrapper = document.getElementById('color-selection-wrapper');
    const colorContainer = document.getElementById('color-selection');
    
    colorWrapper.style.display = 'block';
    colorContainer.innerHTML = '';
    
    // 색상 스와치 생성
    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.background = color;
        swatch.onclick = () => selectColor(color);
        colorContainer.appendChild(swatch);
    });
    
    updateAIMessage(`선택하신 '${keyword}' 키워드에 가장 잘 어울리는 대표 색상들을 제안합니다.`);
}

// 색상 선택 처리
function selectColor(color) {
    appState.primaryColor = color;
    
    // 선택된 색상 스타일 업데이트
    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
        if (swatch.style.background === color || swatch.style.background.toLowerCase() === color.toLowerCase()) {
            swatch.classList.add('selected');
        } else {
            swatch.classList.remove('selected');
        }
    });
    
    // AI 가이드 생성 버튼 표시
    document.getElementById('generate-btn').classList.remove('hidden');
    updateAIMessage("최고의 선택입니다! 이 색상을 기준으로 Primary와 Secondary 컬러 팔레트를 생성합니다.");
}


// ==================== STEP 04: AI 가이드 생성 ====================
// AI 가이드 생성 버튼 클릭 이벤트
document.getElementById('generate-btn').addEventListener('click', async () => {
    const btn = document.getElementById('generate-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> AI 가이드 생성 중...';
    
    try {
        // Netlify Functions API 호출
        const response = await fetch('/.netlify/functions/generate-guide', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context: appState,
                knowledgeBase: knowledgeBase
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayGeneratedGuide(data);
        } else {
            throw new Error('API request failed');
        }
    } catch (error) {
        console.error('Error:', error);
        // API 실패 시 로컬에서 가이드 생성
        const localData = generateLocalReport();
        displayGeneratedGuide(localData);
    }
    
    btn.disabled = false;
    btn.classList.add('hidden');
});

// 로컬에서 가이드 생성 (API 실패 시 대체)
function generateLocalReport() {
    // 선택된 색상 기반으로 팔레트 생성
    const primary = appState.primaryColor;
    const primaryLight = lightenColor(primary, 20);
    const primaryDark = darkenColor(primary, 20);
    const secondary = getComplementaryColor(primary);
    const secondaryLight = lightenColor(secondary, 20);
    const secondaryDark = darkenColor(secondary, 20);
    
    // 생성된 팔레트 데이터 반환
    return {
        colorSystem: {
            primary: { main: primary, light: primaryLight, dark: primaryDark },
            secondary: { main: secondary, light: secondaryLight, dark: secondaryDark }
        },
        typography: {
            bodySize: '16pt',
            headlineSize: '24pt',
            lineHeight: '1.6'
        },
        accessibility: {
            textColorOnPrimary: '#ffffff',
            contrastRatio: '10.0:1'
        }
    };
}

// 생성된 가이드 표시
function displayGeneratedGuide(data) {
    appState.generatedPalette = data.colorSystem;
    
    updateColorDisplay();
    updateTypographyDisplay(data.typography, data.accessibility);
    
    document.getElementById('ai-report').style.display = 'block';
    document.getElementById('guidelines').style.display = 'grid';
    
    updateAIMessage(`${appState.platform} 플랫폼에 최적화된 디자인 가이드가 생성되었습니다!`);
}


// 생성된 색상 팔레트 표시
function updateColorDisplay() {
    const palette = appState.generatedPalette;
    
    // Primary 색상 업데이트
    document.getElementById('primary-main').style.background = palette.primary.main;
    document.getElementById('primary-main').querySelector('.color-code').textContent = palette.primary.main;
    document.getElementById('primary-light').style.background = palette.primary.light;
    document.getElementById('primary-light').querySelector('.color-code').textContent = palette.primary.light;
    document.getElementById('primary-dark').style.background = palette.primary.dark;
    document.getElementById('primary-dark').querySelector('.color-code').textContent = palette.primary.dark;
    
    // Secondary 색상 업데이트
    document.getElementById('secondary-main').style.background = palette.secondary.main;
    document.getElementById('secondary-main').querySelector('.color-code').textContent = palette.secondary.main;
    document.getElementById('secondary-light').style.background = palette.secondary.light;
    document.getElementById('secondary-light').querySelector('.color-code').textContent = palette.secondary.light;
    document.getElementById('secondary-dark').style.background = palette.secondary.dark;
    document.getElementById('secondary-dark').querySelector('.color-code').textContent = palette.secondary.dark;
}

// 생성된 타이포그래피 정보 표시
function updateTypographyDisplay(typography, accessibility) {
    const platformGuide = knowledgeBase.guidelines[appState.platform.toLowerCase()] || knowledgeBase.guidelines.web;
    
    document.getElementById('contrast-description').innerHTML = `Primary 색상을 배경으로 사용할 경우, WCAG AA 기준을 충족하는 텍스트 색상은 <strong>${accessibility.textColorOnPrimary}</strong>이며, 대비는 <strong>${accessibility.contrastRatio}</strong>입니다.`;
    
    document.getElementById('font-size-description').innerHTML = `<strong>${typography.bodySize}</strong> (Body) / <strong>${typography.headlineSize}</strong> (Large Title) / <strong>${platformGuide.font.unit}</strong> 단위 사용`;
}


// === 💅 수정된 부분 시작 ===
// AI 메시지 업데이트 (타이핑 효과 적용)
function updateAIMessage(message) {
    const messageContainer = document.getElementById('ai-message');
    // 기존 타이핑 효과가 있다면 중단
    clearTimeout(typingTimeout);

    let i = 0;
    messageContainer.innerHTML = ''; // 내용을 비우고 시작
    const speed = 30; // 타이핑 속도 (ms)

    function typeWriter() {
        if (i < message.length) {
            // 커서 효과를 위해 마지막에 깜빡이는 요소 추가/제거
            if (messageContainer.querySelector('.typing-cursor')) {
                messageContainer.querySelector('.typing-cursor').remove();
            }

            messageContainer.innerHTML = message.substring(0, i + 1) + '<span class="typing-cursor">|</span>';
            i++;
            typingTimeout = setTimeout(typeWriter, speed);
        } else {
            // 타이핑이 끝나면 커서 제거
            if (messageContainer.querySelector('.typing-cursor')) {
                messageContainer.querySelector('.typing-cursor').remove();
            }
        }
    }

    typeWriter();
}
// === 💅 수정된 부분 끝 ===

// ==================== 색상 조작 헬퍼 함수 ====================
// 색상을 밝게 만들기
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
}

// 색상을 어둡게 만들기
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return "#" + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
}

// 보색 계산
function getComplementaryColor(color) {
    const rgb = parseInt(color.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    // 보색 계산
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    // 조정된 보색 (너무 극단적이지 않게)
    const adjustedR = Math.floor((compR + r * 0.3) / 1.3);
    const adjustedG = Math.floor((compG + g * 0.3) / 1.3);
    const adjustedB = Math.floor((compB + b * 0.3) / 1.3);
    
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
}

// ==================== 페이지 네비게이션 ====================
// 메인 페이지로 이동
function showMainPage() {
    document.querySelector('.main-page').classList.remove('hidden');
    document.querySelector('.lab-page').classList.remove('active');
    document.querySelector('.lab-page').style.display = 'none';
}

// 실험실 페이지로 이동
function showLabPage() {
    document.querySelector('.main-page').classList.add('hidden');
    document.querySelector('.lab-page').classList.add('active');
    document.querySelector('.lab-page').style.display = 'block';
    
    // 생성된 색상이 있으면 실험실에 반영
    if (appState.primaryColor) {
        document.getElementById('bg-color-input').value = appState.primaryColor;
        document.getElementById('bg-color-picker').value = appState.primaryColor;
        updateContrast();
    }
}


// ==================== 실험실 기능 ====================
// 색상 대비 업데이트
function updateContrast() {
    const bgColor = document.getElementById('bg-color-input').value;
    const textColor = document.getElementById('text-color-input').value;
    
    // 대비율 계산
    const ratio = calculateContrast(bgColor, textColor);
    document.getElementById('contrast-ratio').textContent = ratio.toFixed(2) + ' : 1';
    
    // 미리보기 업데이트
    document.getElementById('large-preview').style.background = bgColor;
    document.getElementById('large-preview').style.color = textColor;
    document.getElementById('small-preview').style.background = bgColor;
    document.getElementById('small-preview').style.color = textColor;
    
    // WCAG 기준 통과 여부 표시
    const aaStatus = document.getElementById('aa-status');
    const aaaStatus = document.getElementById('aaa-status');
    
    // AA 기준 (4.5:1)
    aaStatus.classList.toggle('pass', ratio >= 4.5);
    aaStatus.classList.toggle('fail', ratio < 4.5);
    
    // AAA 기준 (7:1)
    aaaStatus.classList.toggle('pass', ratio >= 7);
    aaaStatus.classList.toggle('fail', ratio < 7);
}

// 행간 업데이트
function updateLineHeight(value) {
    document.getElementById('line-height-value').textContent = value;
    document.querySelectorAll('.text-preview').forEach(preview => {
        preview.style.lineHeight = value;
    });
}

// 색상 대비율 계산
function calculateContrast(bg, fg) {
    const bgRgb = hexToRgb(bg);
    const fgRgb = hexToRgb(fg);
    
    if (!bgRgb || !fgRgb) return 1;
    
    // 휘도(luminance) 계산
    const bgLum = luminance(bgRgb);
    const fgLum = luminance(fgRgb);
    
    // 대비율 계산 (밝은색 + 0.05) / (어두운색 + 0.05)
    const lighter = Math.max(bgLum, fgLum);
    const darker = Math.min(bgLum, fgLum);
    
    return (lighter + 0.05) / (darker + 0.05);
}

// HEX를 RGB로 변환
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// 휘도 계산 (WCAG 공식)
function luminance(rgb) {
    const { r, g, b } = rgb;
    const sRGB = [r, g, b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return sRGB[0] * 0.2126 + sRGB[1] * 0.7152 + sRGB[2] * 0.0722;
}

// ==================== 이벤트 리스너 ====================
// 드롭다운 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    if (!event.target.closest('.dropdown-wrapper')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// ==================== 전역 함수 등록 (HTML onclick 핸들러용) ====================
window.toggleDropdown = toggleDropdown;
window.showMainPage = showMainPage;
window.showLabPage = showLabPage;
window.updateContrast = updateContrast;
window.updateLineHeight = updateLineHeight;